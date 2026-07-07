/**
 * Shared Gemini API client — raw fetch only, no SDK.
 * Primary: gemini-2.0-flash (stable GA)
 * Fallback: gemini-1.5-flash (proven reliable)
 */

const PRIMARY  = "gemini-2.5-flash";
const FALLBACK = "gemini-2.5-flash-lite";
const BASE     = "https://generativelanguage.googleapis.com/v1";

export class GeminiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

interface GeminiOptions {
  temperature?:     number;
  maxOutputTokens?: number;
  extraParts?:      { inlineData?: { mimeType: string; data: string }; text?: string }[];
}

function getKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new GeminiError("GEMINI_API_KEY not set in .env.local");
  return k;
}

async function callModel(
  model: string,
  prompt: string,
  opts: GeminiOptions
): Promise<string> {
  const parts: any[] = [{ text: prompt }, ...(opts.extraParts || [])];

  const res = await fetch(
    `${BASE}/models/${model}:generateContent?key=${getKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature:     opts.temperature     ?? 0.4,
          maxOutputTokens: opts.maxOutputTokens ?? 800,
        },
      }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new GeminiError(
      data?.error?.message || `Gemini ${res.status} error`,
      res.status
    );
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new GeminiError("Gemini returned empty response");
  return text.trim();
}

/** Call Gemini with automatic fallback on any failure. */
export async function geminiText(
  prompt: string,
  opts: GeminiOptions = {}
): Promise<string> {
  try {
    return await callModel(PRIMARY, prompt, opts);
  } catch (e) {
    console.warn(`[Gemini] ${PRIMARY} failed, trying ${FALLBACK}:`, (e as Error).message);
    return callModel(FALLBACK, prompt, opts);
  }
}

/** Strip ```json fences Gemini sometimes adds. */
export function stripFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

/** Call Gemini expecting JSON back. Parses and returns typed result. */
export async function geminiJSON<T>(
  prompt: string,
  opts: GeminiOptions = {}
): Promise<T> {
  const raw     = await geminiText(prompt, opts);
  const cleaned = stripFences(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    try {
      const { jsonrepair } = await import("jsonrepair");
      return JSON.parse(jsonrepair(cleaned)) as T;
    } catch {
      throw new GeminiError(
        `Invalid JSON from Gemini. Preview: ${cleaned.slice(0, 150)}`
      );
    }
  }
}

export { PRIMARY as GEMINI_MODEL };