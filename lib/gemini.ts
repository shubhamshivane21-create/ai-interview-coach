/**
 * Shared Gemini API client.
 *
 * ── ROOT CAUSE FIX (2026-06-30) ──────────────────────────────────────────
 * This file previously called `gemini-2.5-flash` as primary and
 * `gemini-1.5-flash` as fallback. Both are now retired by Google:
 *   - gemini-1.5-flash: fully shut down, returns 404 on all API versions.
 *   - gemini-2.5-flash: shut down June 17, 2026 (we are now past that date).
 *
 * Because BOTH the primary and fallback model in every agent were dead,
 * every single Gemini call failed silently and the app fell back to its
 * hardcoded default content 100% of the time. This is why interview
 * questions, evaluations, and study plans all looked "hardcoded" in
 * testing — they WERE hardcoded, just not on purpose. The AI was never
 * actually being called.
 *
 * Fix: use `gemini-flash-latest`, a Google-maintained alias that always
 * points at the current GA Flash model (no manual migration needed when
 * Google retires the underlying model again). Fallback is
 * `gemini-2.5-flash-lite`, which is still active as of this writing.
 *
 * Per project rules: raw fetch only, NO @google/generative-ai SDK.
 * ──────────────────────────────────────────────────────────────────────
 */

const GEMINI_MODEL_PRIMARY = "gemini-2.5-flash-lite";  // ✅ confirmed alive
const GEMINI_MODEL_FALLBACK = "gemini-3.5-flash";       // ✅ GA since May 2026
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1";

export class GeminiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GenerateOptions {
  temperature?: number;
  /** Extra parts to send alongside the text prompt, e.g. inline audio/PDF data. */
  extraParts?: GeminiPart[];
  maxOutputTokens?: number;
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiError(
      "GEMINI_API_KEY is not set. Add it to .env.local (and to your Vercel " +
        "project's Environment Variables if deployed) — see README for setup."
    );
  }
  return key;
}

async function callModel(
  model: string,
  prompt: string,
  options: GenerateOptions
): Promise<string> {
  const apiKey = getApiKey();
  const parts: GeminiPart[] = [{ text: prompt }, ...(options.extraParts || [])];

  const response = await fetch(
    `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: options.temperature ?? 0.5,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
        },
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new GeminiError(
      data?.error?.message || `Gemini API request failed (${response.status})`,
      response.status
    );
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new GeminiError("Gemini returned an empty or unexpected response.");
  }
  return text.trim();
}

/**
 * Calls Gemini and returns the raw text response.
 * Tries the primary model first, falls back to a secondary model on
 * ANY failure (network error, 404 from a retired model, rate limit, etc).
 * Throws GeminiError only if both attempts fail.
 */
export async function geminiGenerateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  try {
    return await callModel(GEMINI_MODEL_PRIMARY, prompt, options);
  } catch (primaryErr) {
    console.warn(
      `[Gemini] Primary model "${GEMINI_MODEL_PRIMARY}" failed, trying fallback "${GEMINI_MODEL_FALLBACK}":`,
      (primaryErr as Error).message
    );
    try {
      return await callModel(GEMINI_MODEL_FALLBACK, prompt, options);
    } catch (fallbackErr) {
      throw new GeminiError(
        `Both Gemini models failed. Primary: ${(primaryErr as Error).message} | ` +
          `Fallback: ${(fallbackErr as Error).message}`
      );
    }
  }
}

/**
 * Strips markdown code-fence wrappers (```json ... ```) that Gemini
 * sometimes adds even when explicitly told not to.
 */
export function stripCodeFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

/**
 * Calls Gemini expecting a JSON response, strips any code-fence wrapper,
 * parses it, and throws a clear error if parsing fails (instead of an
 * opaque "Unexpected token" deep in agent code).
 */
export async function geminiGenerateJSON<T>(
  prompt: string,
  options: GenerateOptions = {}
): Promise<T> {
  const raw = await geminiGenerateText(prompt, options);
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new GeminiError(
      `Gemini's response wasn't valid JSON. Raw output (first 200 chars): ${cleaned.slice(0, 200)}`
    );
  }
}

export { GEMINI_MODEL_PRIMARY as GEMINI_MODEL };
