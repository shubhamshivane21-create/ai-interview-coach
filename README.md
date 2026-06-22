# 🧠 PrepMind AI — AI Interview Coach

> An AI-powered interview preparation platform built with Next.js 16, Gemini 2.5 Flash, MongoDB, and NextAuth.

![PrepMind AI](https://img.shields.io/badge/PrepMind-AI%20Interview%20Coach-emerald?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-blue?style=for-the-badge&logo=google)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

---

## 🚀 What It Does

1. **Upload Resume (PDF)** — AI reads your resume and extracts skills, projects, experience
2. **AI Generates 6 Questions** — Personalized technical, DSA, and behavioral questions based on YOUR resume
3. **Answer via Voice or Text** — Speak or type your answers using Gemini speech-to-text
4. **AI Scores Each Answer** — Scored 0-10 on Communication, Technical accuracy, and Confidence
5. **7-Day Study Plan** — AI identifies weak areas and builds a personalized day-by-day study plan
6. **Session History** — All interviews saved with a Claude-style sidebar showing past sessions
7. **Google & GitHub Sign-in** — Secure authentication via NextAuth.js

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.9 (Turbopack), TypeScript, Tailwind CSS |
| AI/LLM | Google Gemini 2.5 Flash (via raw fetch) |
| Speech-to-Text | Gemini Audio API |
| Database | MongoDB Atlas (via Mongoose) |
| Auth | NextAuth.js (Google + GitHub OAuth) |
| Hosting | Vercel |

---

## 👥 Team Division

| Member | Role | Branch |
|--------|------|--------|
| Member 1 | Frontend + Resume Upload | `feature/frontend` |
| Member 2 | Backend Agents + API Routes | `feature/agents` |
| Member 3 | Voice Pipeline + Database + GitHub | `feature/voice-db` |

---

## 📁 Project Structure

```
ai-interview-coach/
├── app/
│   ├── page.tsx                  ← Landing page with auth
│   ├── upload/page.tsx           ← Resume upload page
│   ├── interview/page.tsx        ← Interview session page
│   ├── results/page.tsx          ← Scores + study plan
│   ├── dashboard/page.tsx        ← History sidebar
│   ├── sign-in/page.tsx          ← Google + GitHub sign in
│   └── api/
│       ├── resume/route.ts       ← Parse PDF resume
│       ├── interview/route.ts    ← Generate questions
│       ├── evaluate/route.ts     ← Score answers
│       ├── learning/route.ts     ← Generate study plan
│       ├── stt/route.ts          ← Speech to text
│       ├── tts/route.ts          ← Text to speech
│       ├── sessions/route.ts     ← Session history
│       └── auth/[...nextauth]/   ← NextAuth config
├── agents/
│   ├── resumeAgent.ts            ← PDF parsing via Gemini
│   ├── interviewAgent.ts         ← Question generation
│   ├── evaluationAgent.ts        ← Answer scoring
│   └── learningAgent.ts          ← Study plan generation
├── lib/
│   └── mongodb.ts                ← MongoDB connection
├── models/
│   └── Session.ts                ← MongoDB session schema
└── .env.local                    ← API keys (never commit!)
```

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/shubhamshivane21-create/ai-interview-coach.git
cd ai-interview-coach
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env.local`
```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Random secret string for NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |

---

## 🎯 Features

- ✅ Resume PDF upload with AI parsing (Gemini reads PDF natively)
- ✅ 6 personalized questions (DSA + Technical + Behavioral)
- ✅ Voice answers via microphone (Gemini STT)
- ✅ Real-time scoring on 3 metrics (0-10 each)
- ✅ 7-day personalized study plan
- ✅ Session history with dashboard sidebar
- ✅ Google & GitHub OAuth sign-in
- ✅ MongoDB session storage
- ✅ Auto-fallback: gemini-2.5-flash → gemini-1.5-flash on quota limit
- ✅ Deployed on Vercel

---

## 📊 Agent Architecture

```
User (Resume PDF + Voice/Text)
        │
        ▼
  Resume Agent      ← Sends PDF to Gemini, extracts skills/projects
        │
        ▼
  Interview Agent   ← Generates 6 personalized questions
        │
        ▼
  Evaluation Agent  ← Scores each answer (0-10) on 3 metrics
        │
        ▼
  Learning Agent    ← Creates 7-day study plan from weak areas
        │
        ▼
    MongoDB         ← Stores sessions, scores, study plans
```

---

## 🚀 Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

---

*Built by a team of 3 students — Week 2 College Project 2026*