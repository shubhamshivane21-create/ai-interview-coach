import { geminiModel } from "../lib/openai";

export interface EvaluationScore {
  communication: number;
  technical: number;
  confidence: number;
  feedback: string;
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  resumeSummary: string
): Promise<EvaluationScore> {
  const prompt = `You are an expert interview evaluator. Score this interview answer on 3 criteria (0-10 each).

Question: ${question}
Candidate's Answer: ${answer}
Candidate's Background: ${resumeSummary}

Return ONLY a JSON object like this:
{
  "communication": 7,
  "technical": 8,
  "confidence": 6,
  "feedback": "Brief constructive feedback here in 2 sentences."
}

No extra text, just the JSON object.`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response.text();

  const cleaned = response.replace(/```json|```/g, "").trim();
  const score: EvaluationScore = JSON.parse(cleaned);

  return score;
}