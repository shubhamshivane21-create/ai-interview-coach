import { geminiModel } from "../lib/openai";

export async function generateQuestions(resumeSummary: string): Promise<string[]> {
  const prompt = `You are an expert technical interviewer. Based on this candidate's resume summary, generate exactly 8 interview questions:
- 4 technical questions based on their specific skills and projects
- 2 behavioral questions  
- 2 situational questions

Resume Summary:
${resumeSummary}

Return ONLY a JSON array of 8 questions like this:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?", "Question 6?", "Question 7?", "Question 8?"]

No extra text, just the JSON array.`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response.text();
  
  const cleaned = response.replace(/```json|```/g, "").trim();
  const questions: string[] = JSON.parse(cleaned);
  
  return questions;
}