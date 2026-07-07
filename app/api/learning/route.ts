import { NextRequest, NextResponse } from "next/server";
import { generateStudyPlan, identifyWeakAreas } from "@/agents/learningAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Identify weak areas from scores
    const weakAreas = identifyWeakAreas(
      session.questions,
      session.answers,
      session.scores as { communication: number; technical: number; confidence: number }[]
    );

    // Generate personalised study plan
    const studyPlan = await generateStudyPlan(weakAreas, session.resumeText);

    // Save to session
    session.weakAreas = weakAreas;
    session.studyPlan = studyPlan as any;
    session.markModified("studyPlan");
    await session.save();

    console.log(`📚 Study plan generated for session ${sessionId} — weak areas: ${weakAreas.join(", ")}`);

    return NextResponse.json({ success: true, weakAreas, studyPlan });
  } catch (error: any) {
    console.error("🔥 Learning route error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate study plan" },
      { status: 500 }
    );
  }
}