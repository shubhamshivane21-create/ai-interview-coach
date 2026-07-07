import { NextRequest, NextResponse } from "next/server";
import { geminiText, GeminiError } from "@/lib/gemini";

const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio    = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }
    if (audio.size > MAX_AUDIO_SIZE) {
      return NextResponse.json({ error: "Audio file too large (max 15MB)" }, { status: 400 });
    }

    const bytes    = await audio.arrayBuffer();
    const base64   = Buffer.from(bytes).toString("base64");
    const mimeType = audio.type || "audio/webm";

    const prompt = `Transcribe this audio recording exactly as spoken. 
Return ONLY the transcribed text, nothing else.
No explanations, no formatting, no punctuation corrections — just the words spoken.`;

    const text = await geminiText(prompt, {
      temperature:     0,
      maxOutputTokens: 500,
      extraParts: [
        { inlineData: { mimeType, data: base64 } },
      ],
    });

    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    console.error("STT error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Transcription failed" },
      { status: 500 }
    );
  }
}