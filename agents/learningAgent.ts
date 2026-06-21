export async function generateStudyPlan(weakAreas: string[], resumeSummary: string): Promise<string> {
  let candidateInfo = "CS/IT student";
  try {
    const p = JSON.parse(resumeSummary);
    candidateInfo = `Name: ${p.name||"Candidate"}. Skills: ${(p.skills||[]).join(", ")}`;
  } catch {}

  const prompt = `Create a 7-day study plan for this candidate.
Candidate: ${candidateInfo}
Weak areas: ${weakAreas.join(", ")}

Format each day exactly like:
DAY 1 — Topic
• What to study: specific topic
• Resource: free YouTube or website
• Practice: specific exercise

(7 days total, then one motivational sentence)`;

  const tryModel = async (model: string, ver: string) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.7,maxOutputTokens:1200} }) }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  };

  try { return await tryModel("gemini-2.5-flash","v1"); }
  catch {
    try { return await tryModel("gemini-1.5-flash","v1beta"); }
    catch {
      return `DAY 1 — Communication Skills
• What to study: STAR method for structuring answers
• Resource: YouTube — "STAR Method" by Jeff H Sipe
• Practice: Write 3 past experiences using STAR format

DAY 2 — Data Structures
• What to study: Arrays, Linked Lists, Stacks, Queues
• Resource: YouTube — "Data Structures" by William Fiset
• Practice: Solve 5 easy LeetCode array problems

DAY 3 — Algorithms
• What to study: Sorting and searching algorithms
• Resource: YouTube — "Algorithms" by Abdul Bari
• Practice: Implement binary search from scratch

DAY 4 — Core Concepts
• What to study: Your primary language's advanced features
• Resource: Official documentation + freeCodeCamp
• Practice: Build a small utility using those features

DAY 5 — System Design
• What to study: Scalability, load balancing, databases
• Resource: YouTube — "System Design" by Gaurav Sen
• Practice: Design a URL shortener on paper

DAY 6 — Project Deep Dive
• What to study: Review and explain your projects clearly
• Resource: Your own GitHub projects
• Practice: Explain each project in 2 minutes to a friend

DAY 7 — Mock Interview
• What to study: Full practice interview
• Resource: Pramp.com (free mock interviews)
• Practice: Complete one full mock interview session

You have everything it takes — stay consistent and your dream offer is within reach! 🚀`;
    }
  }
}

export function identifyWeakAreas(
  questions: string[],
  answers: string[],
  scores: { communication: number; technical: number; confidence: number }[]
): string[] {
  const weak = new Set<string>();
  scores.forEach((s, i) => {
    if (s.technical < 6) weak.add(`Technical: ${(questions[i]||"").slice(0,50)}...`);
    if (s.communication < 6) weak.add("Communication and answer structure");
    if (s.confidence < 6) weak.add("Confidence and clarity");
  });
  if (weak.size === 0) { weak.add("Advanced problem solving"); weak.add("System design"); }
  return [...weak].slice(0, 4);
}