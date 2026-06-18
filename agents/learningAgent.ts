import { geminiModel } from "../lib/openai";

export async function generateStudyPlan(
  weakAreas: string[],
  resumeSummary: string
): Promise<string> {
  const prompt = `You are an expert career coach. Based on this candidate's weak areas from their interview, create a personalized 7-day study plan.

Weak Areas Identified: ${weakAreas.join(", ")}
Candidate Background: ${resumeSummary}

Create a detailed, actionable 7-day study plan with:
- Specific topics to study each day
- Free resources (YouTube, documentation, articles)
- Practice exercises
- Daily time commitment (1-2 hours)

Format it clearly with Day 1, Day 2, etc. Make it encouraging and achievable.`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response.text();

  return response;
}

export async function identifyWeakAreas(
  questions: string[],
  answers: string[],
  scores: { communication: number; technical: number; confidence: number }[]
): Promise<string[]> {
  const weakAreas: string[] = [];

  scores.forEach((score, index) => {
    if (score.technical < 6) {
      weakAreas.push(`Technical knowledge for: ${questions[index]}`);
    }
    if (score.communication < 6) {
      weakAreas.push("Communication and explanation skills");
    }
    if (score.confidence < 6) {
      weakAreas.push("Confidence and delivery");
    }
  });

  return [...new Set(weakAreas)];
}