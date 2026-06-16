import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a File-like object for OpenAI
    const audioFile = new File([buffer], file.name, {
      type: file.type,
    });

    // Call OpenAI Whisper (Speech → Text)
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-transcribe",
    });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error: any) {
    console.error("STT Error:", error);

    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}