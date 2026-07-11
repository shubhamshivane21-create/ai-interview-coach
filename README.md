# 🧠 PrepMind AI — AI Interview Coach

> An AI-powered interview preparation platform that turns your resume into a personalized mock-interview experience with instant feedback and a focused learning plan.

![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-blue?style=for-the-badge&logo=google)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)

## 🌐 Live Demo

[https://ai-interview-coach-red.vercel.app](https://ai-interview-coach-red.vercel.app)

## ✨ Features

- Resume PDF upload and AI-powered resume analysis
- Personalized technical, DSA, and behavioral interview questions
- Company-focused interview practice
- Difficulty selection: easy, medium, and hard
- Text and voice answer input
- AI feedback for communication, technical accuracy, and confidence
- STAR-method detection for behavioral answers
- Personalized 7-day learning plan based on weak areas
- Interview-session history for signed-in users
- Score-trend chart to track interview progress
- Google and GitHub OAuth sign-in
- Responsive mobile-friendly UI
- Dark/light theme support
- Completion celebration with confetti

## 🔄 How It Works

1. Sign in with Google or GitHub.
2. Upload your resume as a PDF.
3. Select a target company and interview difficulty.
4. Receive personalized AI-generated questions.
5. Answer by typing or using the microphone.
6. Get per-question feedback and scores.
7. Review your strengths, weak areas, score trend, and learning plan.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| AI | Google Gemini API |
| Database | MongoDB Atlas with Mongoose |
| Authentication | NextAuth.js with Google and GitHub OAuth |
| Charts | Score-trend visualization |
| Deployment | Vercel |

## 📁 Project Structure

```text
ai-interview-coach/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── upload/page.tsx           # Resume upload and setup
│   ├── interview/page.tsx        # Mock interview experience
│   ├── results/page.tsx          # Feedback, scores, and study plan
│   ├── dashboard/page.tsx        # Session history and score trends
│   └── api/                      # API routes
├── agents/
│   ├── resumeAgent.ts            # Resume analysis
│   ├── interviewAgent.ts         # Question generation
│   ├── evaluationAgent.ts        # Answer evaluation
│   └── learningAgent.ts          # Learning-plan generation
├── components/                   # Reusable UI components
├── lib/                          # Auth, Gemini, and database helpers
├── models/
│   └── Session.ts                # MongoDB interview-session model
└── .env.local                    # Local environment variables
```

## ⚙️ Local Setup

### 1. Clone the repository

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
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔐 Environment Variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API access |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | Application URL |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

## 🚀 Deployment

The project is deployed on Vercel.

To deploy your own version:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add all environment variables in Vercel project settings.
4. Set `NEXTAUTH_URL` to your production domain.
5. Add the production callback URLs in Google and GitHub OAuth settings.
6. Deploy.

## 📌 Recent Improvements

- Company selector and difficulty levels
- Score-trend chart for performance tracking
- STAR-method feedback for behavioral responses
- Improved session-history experience
- Responsive layouts for mobile, tablet, and desktop
- PrepMind AI branding and refined UI
- Confetti celebration after interview completion

---

Built as an AI-powered interview-practice project using Next.js, Gemini, MongoDB, and NextAuth.
