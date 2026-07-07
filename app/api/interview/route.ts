import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/agents/interviewAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sessionId, company, difficulty } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Reuse cached questions if already generated
    if (session.questions?.length > 0) {
      console.log(`📋 Reusing ${session.questions.length} cached questions`);
      return NextResponse.json({
        success:   true,
        questions: session.questions,
        source:    "cached",
        company:   session.company || company || "general",
        difficulty:session.difficulty || difficulty || "medium",
      });
    }

    // Read company/difficulty from session or request
    const co   = session.company    || company    || "general";
    const diff = session.difficulty || difficulty || "medium";

    const { questions, source } = await generateQuestions(
      session.resumeText, co, diff
    );

    if (source === "fallback") {
      console.warn(`⚠️ Using fallback questions for session ${sessionId}`);
    } else {
      console.log(`✅ PrepMind AI generated ${questions.length} questions — company:${co} difficulty:${diff}`);
    }

    session.questions = questions;
    await session.save();

    return NextResponse.json({ success:true, questions, source, company:co, difficulty:diff });
  } catch (error: any) {
    console.error("🔥 Interview route error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}