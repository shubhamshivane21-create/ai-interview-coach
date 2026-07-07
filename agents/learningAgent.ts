import { geminiText } from "@/lib/gemini";

export interface StudyDay {
  day:      number;
  topic:    string;
  study:    string;
  resource: string;
  practice: string;
}

export interface StudyPlan {
  days:       StudyDay[];
  motivation: string;
}

const FALLBACK_PLAN: StudyPlan = {
  motivation: "Stay consistent — your dream offer is one practice session closer! 🚀",
  days: [
    { day:1, topic:"Communication",  study:"STAR method for structuring answers",                resource:"YouTube — Jeff H Sipe STAR Method",       practice:"Write 3 past experiences in STAR format"    },
    { day:2, topic:"Data Structures", study:"Arrays, Linked Lists, Stacks, Queues",              resource:"YouTube — William Fiset Data Structures",  practice:"Solve 5 easy LeetCode array problems"       },
    { day:3, topic:"Algorithms",      study:"Sorting and searching algorithms with complexity",  resource:"YouTube — Abdul Bari Algorithms",           practice:"Implement binary search from scratch"       },
    { day:4, topic:"Core Concepts",   study:"Advanced features of your primary language",        resource:"Official docs + freeCodeCamp",              practice:"Build a small utility using those features" },
    { day:5, topic:"System Design",   study:"Scalability, load balancing, caching, databases",  resource:"YouTube — Gaurav Sen System Design",        practice:"Design a URL shortener on paper"            },
    { day:6, topic:"Project Depth",   study:"Explain your projects clearly end-to-end",          resource:"Your own GitHub repositories",              practice:"Explain each project in 2 minutes"          },
    { day:7, topic:"Mock Interview",  study:"Full timed practice session",                        resource:"Pramp.com — free peer mock interviews",     practice:"Complete one full mock interview session"   },
  ],
};

export async function generateStudyPlan(
  weakAreas:     string[],
  resumeSummary: string
): Promise<StudyPlan> {
  let name = "Candidate", skills = "programming";
  try {
    const p = JSON.parse(resumeSummary);
    name    = p.name   || name;
    skills  = (p.skills || []).slice(0, 6).join(", ") || skills;
  } catch {}

  const prompt = `You are a career coach creating a 7-day study plan.

Candidate: ${name}
Skills: ${skills}
Weak areas to improve: ${weakAreas.slice(0, 4).join(", ")}

Create a practical 7-day study plan. Each day must have:
- A focused topic title
- What to study (one clear sentence)
- A specific FREE resource (YouTube channel, website, or documentation)
- A concrete practice task

Return ONLY valid compact JSON, no markdown, no extra text:
{"days":[{"day":1,"topic":"Topic Name","study":"What to study","resource":"Specific free resource","practice":"Specific task"},...],"motivation":"Short motivational closing sentence"}

All 7 days required. Keep each string under 90 characters.`;

  try {
    const raw     = await geminiText(prompt, { temperature: 0.6, maxOutputTokens: 1800 });
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i,     "")
      .replace(/```\s*$/i,     "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Attempt JSON repair
      const { jsonrepair } = await import("jsonrepair");
      parsed = JSON.parse(jsonrepair(cleaned));
    }

    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error("Invalid plan shape");
    }

    return {
      motivation: String(parsed.motivation || FALLBACK_PLAN.motivation).slice(0, 200),
      days: parsed.days.slice(0, 7).map((d: any, i: number) => ({
        day:      Number(d.day)      || i + 1,
        topic:    String(d.topic    || `Day ${i + 1}`).slice(0, 80),
        study:    String(d.study    || "").slice(0, 120),
        resource: String(d.resource || "").slice(0, 120),
        practice: String(d.practice || "").slice(0, 120),
      })),
    };
  } catch (e) {
    console.error("[learningAgent] Gemini failed, using fallback:", (e as Error).message);
    return FALLBACK_PLAN;
  }
}

export function identifyWeakAreas(
  questions: string[],
  answers:   string[],
  scores:    { communication: number; technical: number; confidence: number }[]
): string[] {
  const weak = new Set<string>();

  scores.forEach((s, i) => {
    if (s.technical     < 6) weak.add(`Technical depth: ${(questions[i] || "").slice(0, 55)}…`);
    if (s.communication < 6) weak.add("Communication and answer structure (STAR method)");
    if (s.confidence    < 6) weak.add("Confidence and assertiveness in answers");
  });

  // Always add general ones if very few weak areas found
  if (weak.size < 2) {
    weak.add("System design and scalability concepts");
    weak.add("Advanced problem solving and DSA");
  }

  return [...weak].slice(0, 4);
}