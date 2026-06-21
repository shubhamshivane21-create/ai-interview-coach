import { NextRequest, NextResponse } from "next/server";
import { geminiGenerateText, GeminiError } from "@/lib/gemini";

const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB — a few minutes of webm/opus

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "Recording is too long. Please keep answers under a few minutes." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Audio = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "audio/webm";

    const text = await geminiGenerateText(
      "Transcribe this audio exactly. Return only the transcribed text, nothing else. No explanations, no punctuation corrections, just the raw transcription.",
      { extraParts: [{ inlineData: { mimeType, data: base64Audio } }] }
    );

    console.log("✅ Transcribed:", text.slice(0, 100));
    return NextResponse.json({ text });
  } catch (error) {
    console.error("STT Error:", error);
    const status = error instanceof GeminiError ? 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to transcribe audio" },
      { status }
    );
  }
}
