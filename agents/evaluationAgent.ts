import { geminiText } from "@/lib/gemini";

export interface EvalScore {
  communication: number;
  technical:     number;
  confidence:    number;
  feedback:      string;
}

export async function evaluateAnswer(
  question:      string,
  answer:        string,
  resumeSummary: string
): Promise<EvalScore> {
  // Extract skills for context
  let skills = "general programming";
  try {
    const p = JSON.parse(resumeSummary);
    skills  = (p.skills || []).slice(0, 5).join(", ") || skills;
  } catch {}

  // Compact prompt = fast response
  const prompt = `You are a strict technical interviewer. Score this answer 1-10 on 3 criteria.

Candidate skills: ${skills}
Question: ${question.slice(0, 150)}
Answer: ${answer.slice(0, 400)}

Scoring guide:
- technical: accuracy, depth, relevant terminology used
- communication: clarity, structure, use of examples
- confidence: assertiveness, first-person ownership, no excessive hedging

Return ONLY valid JSON, no markdown:
{"technical":N,"communication":N,"confidence":N,"feedback":"one specific improvement tip"}

N must be an integer 1-10.`;

  let raw = "";
  try {
    raw = await geminiText(prompt, { temperature: 0.1, maxOutputTokens: 220 });
  } catch (e) {
    console.error("[evaluationAgent] Gemini failed:", (e as Error).message);
    return {
      technical:     5,
      communication: 5,
      confidence:    5,
      feedback:      "Good effort. Focus on adding specific examples and technical depth.",
    };
  }

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i,     "")
    .replace(/```\s*$/i,     "")
    .trim();

  try {
    const s = JSON.parse(cleaned);
    return {
      technical:     Math.min(10, Math.max(1, Number(s.technical)     || 5)),
      communication: Math.min(10, Math.max(1, Number(s.communication) || 5)),
      confidence:    Math.min(10, Math.max(1, Number(s.confidence)    || 5)),
      feedback:      String(s.feedback || "Good effort.").slice(0, 250),
    };
  } catch {
    // Regex fallback if Gemini adds prose around the JSON
    const t  = cleaned.match(/"?technical"?\s*:\s*(\d+)/);
    const c  = cleaned.match(/"?communication"?\s*:\s*(\d+)/);
    const cf = cleaned.match(/"?confidence"?\s*:\s*(\d+)/);
    const f  = cleaned.match(/"?feedback"?\s*:\s*"([^"]+)"/);
    return {
      technical:     t  ? parseInt(t[1])  : 5,
      communication: c  ? parseInt(c[1])  : 5,
      confidence:    cf ? parseInt(cf[1]) : 5,
      feedback:      f  ? f[1]            : "Good effort. Keep practising.",
    };
  }
}