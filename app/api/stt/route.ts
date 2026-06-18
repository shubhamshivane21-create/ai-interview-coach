import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Audio = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type as "audio/webm" | "audio/mp4" | "audio/wav",
          data: base64Audio,
        },
      },
      { text: "Transcribe this audio exactly. Return only the transcribed text, nothing else." },
    ]);

    const text = result.response.text();

    return NextResponse.json({ text });

  } catch (error) {
    console.error("STT Error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}