import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswer } from "@/agents/evaluationAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import { GeminiError } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId, questionIndex, answer } = await req.json();

    if (!sessionId || typeof questionIndex !== "number" || !answer?.trim()) {
      return NextResponse.json(
        { error: "sessionId, questionIndex, and answer are all required" },
        { status: 400 }
      );
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fix: the original indexed straight into session.questions without
    // checking the index was in range, so an out-of-range request would
    // send `undefined` as the question text to Gemini and fail confusingly.
    const question = session.questions?.[questionIndex];
    if (!question) {
      return NextResponse.json(
        { error: `No question found at index ${questionIndex}` },
        { status: 400 }
      );
    }

    const score = await evaluateAnswer(question, answer, session.resumeText);

    session.answers[questionIndex] = answer;
    session.scores[questionIndex] = score;
    await session.save();

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Evaluate API Error:", error);
    const status = error instanceof GeminiError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to evaluate answer" },
      { status }
    );
  }
}
