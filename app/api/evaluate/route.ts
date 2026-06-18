import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswer } from "@/agents/evaluationAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId, questionIndex, answer } = await req.json();

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const question = session.questions[questionIndex];
    const score = await evaluateAnswer(
      question,
      answer,
      session.resumeText
    );

    session.answers[questionIndex] = answer;
    session.scores[questionIndex] = score;
    await session.save();

    return NextResponse.json({ success: true, score });

  } catch (error) {
    console.error("Evaluate API Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}