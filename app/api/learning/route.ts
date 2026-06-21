import { NextRequest, NextResponse } from "next/server";
import { generateStudyPlan, identifyWeakAreas } from "@/agents/learningAgent";
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

    const weakAreas = await identifyWeakAreas(
      session.questions,
      session.answers,
      session.scores
    );

    const studyPlan = await generateStudyPlan(weakAreas, session.resumeText);

    session.weakAreas = weakAreas;
    session.studyPlan = studyPlan;
    await session.save();

    return NextResponse.json({ success: true, weakAreas, studyPlan });
  } catch (error) {
    console.error("Learning API Error:", error);
    const status = error instanceof GeminiError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate study plan" },
      { status }
    );
  }
}
