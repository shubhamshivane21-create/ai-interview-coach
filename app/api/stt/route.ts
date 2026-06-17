import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type });

    const transcription = await openai.audio.transcriptions.create({
      file: blob,
      model: 'whisper-1',
    });

    return NextResponse.json({
      text: transcription.text,
    });

  } catch (error: any) {
    console.error('STT Error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}