export interface EvaluationScore {
  communication: number;
  technical: number;
  confidence: number;
  feedback: string;
}

export async function evaluateAnswer(question: string, answer: string, resumeSummary: string): Promise<EvaluationScore> {
  let bg = "CS student";
  try { const p = JSON.parse(resumeSummary); bg = `Skills: ${(p.skills||[]).join(", ")}`; } catch {}

  const prompt = `Score this interview answer 0-10 on 3 criteria.
Question: ${question}
Answer: ${answer}
Background: ${bg}
Return ONLY: {"communication":7,"technical":6,"confidence":7,"feedback":"One good point. One improvement."}`;

  const tryModel = async (model: string, ver: string) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.1,maxOutputTokens:150} }) }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
  };

  let raw = "{}";
  try { raw = await tryModel("gemini-2.5-flash","v1"); }
  catch { try { raw = await tryModel("gemini-1.5-flash","v1beta"); } catch { return {communication:5,technical:5,confidence:5,feedback:"Good effort. Keep practicing to improve your answers."}; } }

  const cleaned = raw.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
  try {
    const s = JSON.parse(cleaned);
    return { communication:Number(s.communication)||5, technical:Number(s.technical)||5, confidence:Number(s.confidence)||5, feedback:s.feedback||"Good effort." };
  } catch {
    const c = cleaned.match(/"?communication"?\s*:\s*(\d+)/);
    const t = cleaned.match(/"?technical"?\s*:\s*(\d+)/);
    const cf = cleaned.match(/"?confidence"?\s*:\s*(\d+)/);
    const f = cleaned.match(/"?feedback"?\s*:\s*"([^"]+)"/);
    return { communication:c?parseInt(c[1]):5, technical:t?parseInt(t[1]):5, confidence:cf?parseInt(cf[1]):5, feedback:f?f[1]:"Good effort. Keep practicing." };
  }
}