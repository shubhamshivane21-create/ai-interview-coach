import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/agents/interviewAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import { GeminiError } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fix: if the interview was already generated (e.g. user refreshed the
    // page), reuse the saved questions instead of calling Gemini again and
    // overwriting any in-progress answers/scores.
    if (session.questions?.length > 0) {
      return NextResponse.json({ success: true, questions: session.questions });
    }

    const questions = await generateQuestions(session.resumeText);
    session.questions = questions;
    await session.save();

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Interview API Error:", error);
    const status = error instanceof GeminiError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate questions" },
      { status }
    );
  }
}
