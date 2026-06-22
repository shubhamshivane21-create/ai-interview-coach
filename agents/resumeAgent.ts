export async function parseResume(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("📄 Sending PDF to Gemini...");
    const base64Pdf = pdfBuffer.toString("base64");

    const tryModel = async (model: string, apiVersion: string): Promise<string> => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: "application/pdf", data: base64Pdf } },
                {
                  text: `Read this resume. Return ONLY this JSON (no markdown, no extra text):
{"name":"full name","skills":["skill1","skill2"],"projects":["project1"],"experience":["job1"],"education":["degree1"]}

Keep each array item SHORT (under 60 chars). Max 8 skills, 3 projects, 2 experience, 1 education.`
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1024,
            },
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || "API failed");
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    };

    let output = "";
    try {
      output = await tryModel("gemini-2.5-flash", "v1");
    } catch (e: any) {
      console.log("⚠️ Falling back to gemini-1.5-flash...");
      output = await tryModel("gemini-1.5-flash", "v1beta");
    }

    // Clean markdown fences
    const cleaned = output
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    console.log("🔍 Raw output length:", cleaned.length);
    console.log("🔍 Last 50 chars:", cleaned.slice(-50));

    // Try to parse — if truncated, try to fix it
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.log("⚠️ JSON truncated, attempting repair...");
      // Close any open arrays and object
      let repaired = cleaned;
      // Count unclosed brackets
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;
      const diff = openBrackets - closeBrackets;
      // Remove trailing incomplete string if any
      repaired = repaired.replace(/,?\s*"[^"]*$/, "");
      // Close open arrays
      for (let i = 0; i < diff; i++) repaired += "]";
      // Close object if needed
      if (!repaired.trim().endsWith("}")) repaired += "}";
      console.log("🔧 Repaired JSON:", repaired.slice(-80));
      parsed = JSON.parse(repaired);
    }

    const result = {
      name: parsed.name || "Candidate",
      email: parsed.email || "",
      phone: parsed.phone || "",
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 10) : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects.slice(0, 4) : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience.slice(0, 3) : [],
      education: Array.isArray(parsed.education) ? parsed.education.slice(0, 2) : [],
      summary: parsed.summary || "",
    };

    console.log("✅ Resume OK:", result.name, "| Skills:", result.skills.length, "| Projects:", result.projects.length);
    return JSON.stringify(result);

  } catch (error: any) {
    console.error("❌ Resume Agent Error:", error.message);
    throw error;
  }
}