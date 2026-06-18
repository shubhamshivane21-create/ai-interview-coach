import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/agents/resumeAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const resumeSummary = await parseResume(buffer);

    const session = await Session.create({
      resumeText: resumeSummary,
      questions: [],
      answers: [],
      scores: [],
      weakAreas: [],
      studyPlan: "",
    });

    return NextResponse.json({
      success: true,
      sessionId: session._id,
      resumeSummary,
    });

  } catch (error) {
    console.error("Resume API Error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}