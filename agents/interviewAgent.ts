export async function generateQuestions(resumeSummary: string): Promise<string[]> {
  let resumeData: any = {};
  try { resumeData = JSON.parse(resumeSummary); } catch {}

  const skills = (resumeData.skills || []).join(", ") || "Python, JavaScript";
  const projects = (resumeData.projects || []).join("; ") || "various projects";
  const experience = (resumeData.experience || []).join("; ") || "fresher";
  const name = resumeData.name || "Candidate";
  const contextLower = skills.toLowerCase();
  const lang = contextLower.includes("python") ? "Python"
    : contextLower.includes("java") && !contextLower.includes("javascript") ? "Java"
    : contextLower.includes("javascript") || contextLower.includes("react") ? "JavaScript"
    : contextLower.includes("c++") ? "C++" : "Python";

  const prompt = `Generate 6 interview questions for ${name} (skills: ${skills}, projects: ${projects}).
Mix: 1 DSA coding in ${lang}, 1 concept from their skills, 1 about their project, 1 system design, 1 behavioral, 1 HR.
Return ONLY JSON array of 6 strings, no markdown: ["q1","q2","q3","q4","q5","q6"]`;

  const tryModel = async (model: string, ver: string) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.7,maxOutputTokens:800} }) }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "failed");
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";
  };

  const fallback = [
    `Write a ${lang} function to find all pairs in an array that sum to a given target.`,
    `Explain the difference between ${lang === "Python" ? "lists and tuples" : "var, let, and const"} with examples.`,
    `Walk me through the most complex technical challenge in one of your projects and how you solved it.`,
    `How would you design a backend system that handles 10,000 concurrent users?`,
    `Tell me about a time you learned a new technology quickly for a deadline. What was your approach?`,
    `Where do you see yourself in 3 years and how does this role fit your career goals?`
  ];

  let raw = "";
  try { raw = await tryModel("gemini-2.5-flash", "v1"); }
  catch { try { raw = await tryModel("gemini-1.5-flash", "v1beta"); } catch { return fallback; } }

  const cleaned = raw.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
  try {
    const q: string[] = JSON.parse(cleaned);
    if (!Array.isArray(q) || q.length < 3) throw new Error("bad array");
    return q.slice(0, 6);
  } catch { return fallback; }
}