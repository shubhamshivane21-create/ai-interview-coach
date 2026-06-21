/**
 * Shared Gemini API client.
 *
 * Every agent previously duplicated its own `fetch()` call to the Gemini
 * endpoint with copy-pasted error handling and JSON-cleanup logic. That
 * meant changing the model name or endpoint required editing five files.
 * This module is now the single place that knows the model, endpoint,
 * and API key — agents call `geminiGenerateText()` or
 * `geminiGenerateJSON()` and never touch `fetch()` directly.
 *
 * Per project rules: raw fetch only, NO @google/generative-ai SDK.
 */

const GEMINI_MODEL = "gemini-2.5-flash";
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
  /** Extra parts to send alongside the text prompt, e.g. inline audio data. */
  extraParts?: GeminiPart[];
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiError(
      "GEMINI_API_KEY is not set. Add it to .env.local — see README for setup."
    );
  }
  return key;
}

/**
 * Calls Gemini and returns the raw text response.
 * Throws GeminiError with a readable message on any failure.
 */
export async function geminiGenerateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const apiKey = getApiKey();
  const parts: GeminiPart[] = [{ text: prompt }, ...(options.extraParts || [])];

  let response: Response;
  try {
    response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: options.temperature ?? 0.5 },
        }),
      }
    );
  } catch (networkErr) {
    throw new GeminiError(
      `Could not reach Gemini API: ${(networkErr as Error).message}`
    );
  }

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

export { GEMINI_MODEL };
