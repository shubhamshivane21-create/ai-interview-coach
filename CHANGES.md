# PrepMind AI — Fix Report
> Mapped directly to your teacher's feedback (score: 5)

---

## Teacher's feedback, quoted:
> "The project is deployed and functional, with a correct implementation of the core problem statement. However, **the interview questions appear to be hardcoded rather than dynamically generated based on user input**. **The learning path generation has formatting issues** that should be resolved. **Session history is not maintained between interactions**. The overall scope of the project is quite basic and would benefit from deeper feature development in subsequent iterations."

Three concrete bugs, three concrete fixes below.

---

## 🔴 Bug 1: "Interview questions appear hardcoded"

### Root cause (this is the big one)
Your code calls Google's Gemini API using two hardcoded model names:
- Primary: `gemini-2.5-flash`
- Fallback: `gemini-1.5-flash`

**Both of these models are now retired by Google.** `gemini-1.5-flash` has been fully shut down for months. `gemini-2.5-flash` was shut down on **June 17, 2026** — about two weeks before you read this.

This means every single call to Gemini — for questions, for evaluation, for the study plan — has been failing with a 404 error. Your code was written defensively with a `try/catch` that falls back to a hardcoded backup list when Gemini fails. That fallback code is good practice, but because *both* models died, the fallback was firing **100% of the time**, every single test run. The AI was never actually being called. That's exactly why it looked hardcoded — for a while, it effectively was, just not because you wrote it that way.

### Fix
`lib/gemini.ts` now uses `gemini-flash-latest` — a Google-maintained alias that always points to whichever Flash model is currently active. When Google retires the model behind it again (they're doing this every few months — see their official deprecation page), your alias keeps working with zero code changes. Fallback model is `gemini-2.5-flash-lite` (active as of today).

I also added a `source: "ai" | "fallback" | "cached"` field to the `/api/interview` response and a console warning whenever fallback fires, so if this ever happens again you'll see it immediately in your Vercel logs instead of silently getting hardcoded content.

**Action required from you:** make sure `GEMINI_API_KEY` is set correctly in your Vercel project's Environment Variables (Settings → Environment Variables), not just in your local `.env.local`. Redeploy after updating it.

---

## 🔴 Bug 2: "Learning path generation has formatting issues"

### Root cause
`agents/learningAgent.ts` asked Gemini to return a single block of plain text like:

```
DAY 1 — Topic
• What to study: specific topic
• Resource: free YouTube or website
• Practice: specific exercise
```

Your frontend (`app/results/page.tsx`) then dumped that raw string into a `<div>` using `whitespace-pre-wrap`. Whatever spacing, bullet style, or em-dash formatting Gemini happened to produce that run is exactly what rendered — there was no actual layout structure behind it, just preserved whitespace from an AI text response. That's inherently fragile.

### Fix
`agents/learningAgent.ts` now asks Gemini for **structured JSON** instead:
```json
{ "days": [{ "day": 1, "topic": "...", "study": "...", "resource": "...", "practice": "..." }], "motivation": "..." }
```
`app/results/page.tsx` and `app/dashboard/page.tsx` now render each day as its own card with consistent styling, regardless of what whitespace Gemini's response happens to contain. Old sessions (saved before this fix, if any) still render correctly via a backward-compatibility check for the old string format.

---

## 🔴 Bug 3: "Session history is not maintained between interactions"

### Root cause — two separate bugs that compound each other

**Bug 3a:** `app/api/auth/[...nextauth]/route.ts` had empty NextAuth callbacks:
```ts
async session({ session, token }) { return session; }
async jwt({ token, user }) { return token; }
```
These never attached the signed-in user's ID to anything. So even though Google/GitHub sign-in worked, the app had no idea *which* signed-in user was making each request.

**Bug 3b:** `app/api/resume/route.ts` created every interview session like this:
```ts
const session = await Session.create({ resumeText, questions: [], ... });
```
No `userId` field — ever. Combined with Bug 3a (no way to know who's signed in anyway), every session was saved as anonymous.

**Bug 3c:** `app/api/sessions/route.ts` (which powers your dashboard) ran:
```ts
const sessions = await Session.find({});
```
**No filter at all.** This returned every session from every user combined. So even ignoring 3a/3b, this endpoint was never going to show "your" history specifically — it would show everyone's.

### Fix
- `lib/authOptions.ts` (new shared config) — `jwt` callback now persists `user.id` onto the token at sign-in; `session` callback copies it onto `session.user.id`.
- `app/api/resume/route.ts` — reads the signed-in user via `getServerSession(authOptions)` and attaches `userId` to the new session, if signed in.
- `app/api/sessions/route.ts` — now requires sign-in and filters with `Session.find({ userId })`, scoped to the logged-in user only.
- `models/Session.ts` — `userId` field properly indexed.

Guests (no sign-in) still work exactly as before for the interview flow itself — they just won't see a history sidebar, which is expected since there's no account to attach history to.

---

## Files changed

| File | What changed |
|---|---|
| `lib/gemini.ts` | Dead models → `gemini-flash-latest` + live fallback, auto-retry logic |
| `lib/authOptions.ts` | **New file.** Shared NextAuth config with working callbacks |
| `agents/resumeAgent.ts` | Uses shared Gemini client |
| `agents/interviewAgent.ts` | Uses shared Gemini client, returns `source` flag |
| `agents/evaluationAgent.ts` | Uses shared Gemini client |
| `agents/learningAgent.ts` | Uses shared Gemini client, returns structured JSON instead of text blob |
| `models/Session.ts` | `studyPlan` field now `Mixed` type to hold structured data |
| `app/api/auth/[...nextauth]/route.ts` | Now imports `authOptions` from shared file |
| `app/api/resume/route.ts` | Attaches `userId` from signed-in session |
| `app/api/sessions/route.ts` | Requires auth, filters by `userId` |
| `app/api/interview/route.ts` | Logs/surfaces `source: "fallback"` for debuggability |
| `app/api/learning/route.ts` | No logic change — confirmed compatible with new structured plan |
| `app/results/page.tsx` | Renders study plan as day cards, backward-compatible |
| `app/dashboard/page.tsx` | Same rendering fix in the preview panel |

---

## How to deploy this

1. Copy every file above into the matching path in your repo (same structure).
2. **Check your Vercel env vars** — this is the step most likely to matter most. Go to your Vercel project → Settings → Environment Variables and confirm `GEMINI_API_KEY` is set there (not just locally), along with `MONGODB_URI`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
3. Commit and push — Vercel will auto-redeploy.
4. Test: upload a resume twice with the same Google account signed in. The dashboard sidebar should now show both as separate history entries.
5. Test: generate a study plan and check it renders as numbered day cards, not a wall of text.
6. Watch your Vercel function logs after testing the interview flow — if you ever see `[interview/route] Using fallback questions`, that means Gemini failed again and you should check the API key / model status.

---

## On "scope is basic, needs deeper development"

That's a scope/ambition note, not a bug — there's no single fix for it. If you want to address it for a resubmission, the highest-leverage additions given what's already built would be: a single composite "interview readiness score" trend chart across sessions (you already store the data, just isn't visualized over time), exporting a session as a PDF report, and a basic admin/analytics view since you already have MongoDB wired up. All three build directly on code you already have rather than new infrastructure.
