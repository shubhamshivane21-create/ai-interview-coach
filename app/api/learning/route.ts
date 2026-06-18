import { NextRequest, NextResponse } from "next/server";
import { generateStudyPlan, identifyWeakAreas } from "@/agents/learningAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId } = await req.json();

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const weakAreas = await identifyWeakAreas(
      session.questions,
      session.answers,
      session.scores
    );

    const studyPlan = await generateStudyPlan(
      weakAreas,
      session.resumeText
    );

    session.weakAreas = weakAreas;
    session.studyPlan = studyPlan;
    await session.save();

    return NextResponse.json({ success: true, weakAreas, studyPlan });

  } catch (error) {
    console.error("Learning API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate study plan" },
      { status: 500 }
    );
  }
}