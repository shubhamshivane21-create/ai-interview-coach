import { NextRequest, NextResponse } from "next/server";

/**
 * Text-to-speech route.
 *
 * BUG FIX: the original implementation called Google Cloud's separate
 * Text-to-Speech REST API (`texttospeech.googleapis.com`) using the
 * GEMINI_API_KEY as the auth key. That's a different Google Cloud product
 * with its own billing/enablement requirements — an AI Studio Gemini key
 * will not authorize it, so this endpoint would fail in production with a
 * 403/401 the moment someone actually called it.
 *
 * Fixed version: uses Gemini's own native TTS support via generateContent
 * with `responseModalities: ["AUDIO"]`. Same GEMINI_API_KEY, same `v1beta`
 * surface Gemini already uses for audio, no second API to enable.
 * Gemini TTS returns raw 16-bit PCM audio, so we wrap it in a minimal WAV
 * header before sending it to the browser (browsers can't play raw PCM
 * directly without a container).
 */

const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const SAMPLE_RATE = 24000;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set. Add it to .env.local." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini TTS error:", data);
      return NextResponse.json(
        { error: data?.error?.message || "Text-to-speech generation failed" },
        { status: 502 }
      );
    }

    const inline = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inline?.data) {
      throw new Error("No audio data received from Gemini");
    }

    const pcmBuffer = Buffer.from(inline.data, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, SAMPLE_RATE);

return new NextResponse(new Uint8Array(wavBuffer), {      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": wavBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate audio" },
      { status: 500 }
    );
  }
}

/**
 * Wraps raw 16-bit signed PCM (mono) in a minimal WAV header so browsers
 * can play it via a normal <audio> element.
 */
function pcmToWav(pcmData: Buffer, sampleRate: number, channels = 1, bitDepth = 16): Buffer {
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;
  const dataSize = pcmData.length;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}
