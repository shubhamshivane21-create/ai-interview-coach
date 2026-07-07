import { geminiText, GeminiError } from "@/lib/gemini";

export async function parseResume(pdfBuffer: Buffer): Promise<string> {
  console.log("📄 Sending PDF to Gemini...");

  const base64Pdf = pdfBuffer.toString("base64");

  const prompt = `Read this resume carefully. Extract all information and return ONLY valid JSON — no markdown, no extra text, no backticks.

Return exactly this shape:
{
  "name": "full name",
  "email": "email or empty string",
  "phone": "phone or empty string",
  "skills": ["skill1", "skill2", "skill3"],
  "projects": ["Project Name 1", "Project Name 2"],
  "experience": ["Job Title at Company (year)", "another role"],
  "education": ["Degree at University (year)"],
  "summary": "2 sentence professional summary of the candidate"
}

Rules:
- skills: up to 10 real technical skills only
- projects: project names only, up to 4
- experience: keep each under 60 chars
- education: keep each under 80 chars
- summary: 1-2 sentences, professional tone`;

  let output: string;
  try {
    output = await geminiText(prompt, {
      temperature:     0.1,
      maxOutputTokens: 1024,
      extraParts: [
        { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
      ],
    });
  } catch (e) {
    console.error("❌ Resume Agent Error:", (e as Error).message);
    throw e instanceof GeminiError ? e : new GeminiError((e as Error).message);
  }

  // Strip any accidental markdown fences
  const cleaned = output
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  console.log("🔍 Raw output length:", cleaned.length);

  // Parse — attempt repair if truncated
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.log("⚠️ JSON truncated, attempting repair...");
    try {
      const { jsonrepair } = await import("jsonrepair");
      parsed = JSON.parse(jsonrepair(cleaned));
    } catch {
      throw new GeminiError(
        `Could not parse resume JSON. Raw (last 100 chars): ${cleaned.slice(-100)}`
      );
    }
  }

  const result = {
    name:       parsed.name       || "Candidate",
    email:      parsed.email      || "",
    phone:      parsed.phone      || "",
    skills:     Array.isArray(parsed.skills)     ? parsed.skills.slice(0, 10)  : [],
    projects:   Array.isArray(parsed.projects)   ? parsed.projects.slice(0, 4) : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience.slice(0, 3) : [],
    education:  Array.isArray(parsed.education)  ? parsed.education.slice(0, 2) : [],
    summary:    parsed.summary    || "",
  };

  console.log(
    `✅ Resume OK: ${result.name} | Skills: ${result.skills.length} | Projects: ${result.projects.length}`
  );

  return JSON.stringify(result);
}