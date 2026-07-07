import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswer } from "@/agents/evaluationAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId, questionIndex, answer } = await req.json();

    if (!sessionId || answer === undefined || questionIndex === undefined) {
      return NextResponse.json(
        { error: "sessionId, questionIndex and answer are required" },
        { status: 400 }
      );
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const question = session.questions[questionIndex] || "";

    // Evaluate the answer
    const score = await evaluateAnswer(question, answer, session.resumeText);

    // Save answer + score to session
    session.answers[questionIndex] = answer;
    session.scores[questionIndex]  = score;

    // Mark as modified so Mongoose saves arrays correctly
    session.markModified("answers");
    session.markModified("scores");
    await session.save();

    console.log(
      `📊 Q${questionIndex + 1} scored — T:${score.technical} C:${score.communication} Cf:${score.confidence}`
    );

    return NextResponse.json({ success: true, score });
  } catch (error: any) {
    console.error("🔥 Evaluate route error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}