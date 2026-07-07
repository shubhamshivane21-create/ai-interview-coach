import { geminiText } from "@/lib/gemini";

export interface GeneratedQuestions {
  questions: string[];
  source:    "ai" | "fallback";
}

/* ─── Company-specific question styles ──────────────────────────────────── */
const COMPANY_CONTEXT: Record<string, string> = {
  google:    "Focus on scalability, algorithms, data structures, system design at scale, and Googleyness (ambiguity, collaboration).",
  amazon:    "Focus on Leadership Principles (ownership, dive deep, customer obsession), system design, and behavioural STAR stories.",
  microsoft: "Focus on problem solving, growth mindset, collaboration, Azure/cloud concepts, and coding fundamentals.",
  apple:     "Focus on attention to detail, user experience thinking, innovation, hardware-software integration, and quality.",
  meta:      "Focus on product sense, data structures, distributed systems, move fast culture, and impact-driven answers.",
  netflix:   "Focus on freedom and responsibility, senior-level ownership, streaming/distributed systems, and data-driven decisions.",
  tcs:       "Focus on core CS fundamentals, project explanation, team work, adaptability, and process-oriented thinking.",
  infosys:   "Focus on communication, project experience, basic CS concepts, client interaction, and growth mindset.",
  accenture: "Focus on consulting mindset, client communication, adaptability, technology trends, and teamwork.",
  startup:   "Focus on wearing multiple hats, fast learning, product thinking, ownership, and building from scratch.",
  general:   "Balance technical depth with strong communication, STAR-method stories, and genuine career motivation.",
};

const DIFFICULTY_CONTEXT: Record<string, string> = {
  easy:   "Keep questions simple — suitable for freshers and entry-level candidates. Avoid deep system design.",
  medium: "Mix of moderate technical and behavioural questions for 1-3 year experience candidates.",
  hard:   "Advanced technical depth, complex system design, and senior behavioural scenarios for 3-5 year candidates.",
  expert: "Expert-level: distributed systems, architecture decisions, technical leadership for 5+ year senior candidates.",
};

export async function generateQuestions(
  resumeSummary: string,
  company    = "general",
  difficulty = "medium"
): Promise<GeneratedQuestions> {
  let resumeData: any = {};
  try { resumeData = JSON.parse(resumeSummary); } catch {}

  const name       = resumeData.name       || "Candidate";
  const skills     = (resumeData.skills    || []).join(", ") || "programming";
  const projects   = (resumeData.projects  || []).join("; ") || "various projects";
  const experience = (resumeData.experience|| []).join("; ") || "fresher";

  const low  = skills.toLowerCase();
  const lang = low.includes("python")     ? "Python"
    : low.includes("java") && !low.includes("javascript") ? "Java"
    : low.includes("c++")                 ? "C++"
    : low.includes("javascript") || low.includes("react") || low.includes("node") ? "JavaScript"
    : "Python";

  const companyCtx    = COMPANY_CONTEXT[company]    || COMPANY_CONTEXT.general;
  const difficultyCtx = DIFFICULTY_CONTEXT[difficulty] || DIFFICULTY_CONTEXT.medium;
  const companyLabel  = company.charAt(0).toUpperCase() + company.slice(1);

  const FALLBACK: GeneratedQuestions = {
    source: "fallback",
    questions: [
      `Write a ${lang} function to find all pairs in an array that sum to a given target. Explain your time complexity.`,
      `You listed ${skills.split(",")[0]?.trim() || "programming"} on your resume. Explain the most advanced concept you have used from it with a real example.`,
      `Walk me through the most complex technical challenge in your project "${projects.split(";")[0]?.trim() || "your main project"}" and how you solved it.`,
      `How would you design a scalable backend system that handles 10,000 concurrent users? What are the bottlenecks?`,
      `Tell me about a time you had to learn a new technology quickly under a deadline. What was your approach?`,
      `Where do you see yourself in 3 years and how does this ${companyLabel} Software Engineer role fit your career goals?`,
    ],
  };

  const prompt = `You are a senior technical interviewer at ${companyLabel}.

Candidate: ${name}
Skills: ${skills}
Projects: ${projects}
Experience: ${experience}

Company interview style: ${companyCtx}
Difficulty level: ${difficultyCtx}

Generate exactly 6 interview questions tailored to this candidate for ${companyLabel} at ${difficulty} difficulty.

Mix:
1. One DSA/coding question in ${lang} appropriate for ${difficulty} level
2. One deep-dive on a skill from their resume relevant to ${companyLabel}
3. One question about their project "${projects.split(";")[0]?.trim()}"
4. One system design question appropriate for ${difficulty} level and ${companyLabel} style
5. One behavioural question aligned with ${companyLabel} culture
6. One HR/motivation question specific to ${companyLabel}

Rules:
- Every question must be SPECIFIC to this candidate and ${companyLabel}
- Match complexity to ${difficulty} difficulty
- Each question max 2 sentences
- Return ONLY a JSON array of 6 strings, no markdown, no extra text

Example: ["question1","question2","question3","question4","question5","question6"]`;

  try {
    const raw = await geminiText(prompt, {
      temperature:     0.7,
      maxOutputTokens: 700,
    });
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i,     "")
      .replace(/```\s*$/i,     "")
      .trim();

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length < 3) throw new Error("bad array");
    return { questions: parsed.slice(0, 6), source: "ai" };
  } catch (e) {
    console.error("[interviewAgent] Gemini failed, using fallback:", (e as Error).message);
    return FALLBACK;
  }
}