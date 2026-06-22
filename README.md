# PrepMind AI — AI Interview Coach

> 🚀 **Live Demo:** [https://ai-interview-coach-red.vercel.app](https://ai-interview-coach-red.vercel.app)

An AI-powered interview preparation platform that analyzes a candidate's resume, generates personalized interview questions, evaluates spoken or typed answers, and tracks progress over time through a session dashboard.

## Features

- **Resume parsing** — upload a PDF resume; Google Gemini extracts skills, projects, experience, and education directly from the file.
- **Personalized question generation** — interview questions are generated based on the candidate's actual background rather than a generic question bank.
- **Voice-to-text answers** — candidates can respond by voice (with text input as a fallback), captured via the browser's MediaRecorder API.
- **AI answer evaluation** — responses are scored and given feedback automatically.
- **Session dashboard** — a history of past interview sessions and scores, stored per user.
- **Authentication** — sign-in via Google and GitHub OAuth, handled through NextAuth.

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **AI:** Google Gemini API (resume parsing, question generation, evaluation)
- **Database:** MongoDB Atlas
- **Auth:** NextAuth.js (Google & GitHub providers)
- **Deployment:** Vercel

## Project Structure

```
app/
  api/            # API routes (auth, resume, interview, evaluate, sessions, learning, stt, tts)
  upload/         # Resume upload page
  interview/      # Interview flow page
  results/        # Results page
  sign-in/        # Sign-in page
  dashboard/      # Session history dashboard
agents/           # AI agent logic (resume parsing, interview, evaluation, learning)
lib/              # Shared utilities (Gemini client, MongoDB connection)
models/           # MongoDB schema definitions (e.g. Session)
components/       # Shared React components
```

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/shubhamshivane21-create/ai-interview-coach.git
cd ai-interview-coach
npm install
```

Create a `.env.local` file in the project root with the following variables (ask a team member for actual values — never commit this file):

```
GEMINI_API_KEY=
MONGODB_URI=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is deployed on [Vercel](https://vercel.com) at [https://ai-interview-coach-red.vercel.app](https://ai-interview-coach-red.vercel.app).

On deploy, make sure to:
- Set all environment variables listed above in the Vercel project settings.
- Update `NEXTAUTH_URL` to the production domain after the first deploy.
- Add the production callback URLs to both the Google Cloud OAuth client and the GitHub OAuth App.
- Allow access from anywhere (`0.0.0.0/0`) in MongoDB Atlas Network Access.

## Team

| Member | Area |
|---|---|
| Member 1 | Frontend (pages, UI, auth flow) |
| Member 2 | Backend (AI agents, API routes) |
| Member 3 | Database, sessions, dashboard integration |

## License

This project is for educational/portfolio purposes.