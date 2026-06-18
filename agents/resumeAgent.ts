import { geminiModel } from "../lib/openai";
const pdf = require("pdf-parse");
export async function parseResume(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer);
  const resumeText = data.text;

  const prompt = `You are an expert resume analyzer. Extract and summarize the following information from this resume in a structured way:
  
1. Full Name
2. Skills (technical and soft skills)
3. Work Experience (company, role, duration)
4. Education
5. Projects
6. Key strengths

Resume text:
${resumeText}

Provide a clean, structured summary that will be used to generate interview questions.`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response.text();
  
  return response;
}

export async function extractResumeText(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer);
  return data.text;
}