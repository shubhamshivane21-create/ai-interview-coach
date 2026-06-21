import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/agents/resumeAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import { GeminiError } from "@/lib/gemini";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Fix: the client validated file type/size, but a request crafted
    // directly against this endpoint (or a future UI change) could skip
    // that check entirely. Validate again here, server-side.
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Please upload a PDF under 10MB." },
        { status: 400 }
      );
    }

    console.log("📂 File:", file.name, `(${(file.size / 1024).toFixed(1)} KB)`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const resumeSummary = await parseResume(buffer);

    console.log("🤖 Gemini done");

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
    console.error("🔥 Resume route error:", error);
    const status = error instanceof GeminiError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process resume" },
      { status }
    );
  }
}
