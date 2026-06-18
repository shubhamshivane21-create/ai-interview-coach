import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/agents/interviewAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const questions = await generateQuestions(session.resumeText);
    session.questions = questions;
    await session.save();

    return NextResponse.json({ success: true, questions });

  } catch (error) {
    console.error("Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}