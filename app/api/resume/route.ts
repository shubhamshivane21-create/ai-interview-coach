import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { parseResume } from "@/agents/resumeAgent";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData  = await req.formData();
    const file      = formData.get("resume")     as File   | null;
    const company   = formData.get("company")    as string | null || "general";
    const difficulty= formData.get("difficulty") as string | null || "medium";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File must be under 10 MB." }, { status: 400 });
    }

    console.log(`📂 File: ${file.name} (${(file.size/1024).toFixed(1)} KB)`);

    const bytes      = await file.arrayBuffer();
    const buffer     = Buffer.from(bytes);
    const resumeText = await parseResume(buffer);

    const authSession = await getServerSession(authOptions).catch(() => null);
    const userId      = (authSession?.user as { id?: string } | undefined)?.id;

    const session = await Session.create({
      resumeText,
      questions:  [],
      answers:    [],
      scores:     [],
      weakAreas:  [],
      studyPlan:  null,
      company,
      difficulty,
      ...(userId ? { userId } : {}),
    });

    console.log(`✅ Session created: ${session._id} | company:${company} | difficulty:${difficulty}`);

    return NextResponse.json({
      success:    true,
      sessionId:  session._id,
      resumeText,
    });
  } catch (error: any) {
    console.error("🔥 Resume route error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to process resume" },
      { status: 502 }
    );
  }
}