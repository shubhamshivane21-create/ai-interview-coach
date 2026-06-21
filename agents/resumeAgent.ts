import { jsonrepair } from "jsonrepair"; // npm install jsonrepair

export async function parseResume(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("📄 Sending PDF directly to Gemini...");
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
                { text: `Extract resume info. Return ONLY this JSON, no markdown:
{"name":"","email":"","phone":"","skills":[],"projects":[],"experience":[],"education":[],"summary":""}` }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 3000 },
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || "API failed");

      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason === "MAX_TOKENS") {
        console.log("⚠️ Response was truncated by token limit");
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    };

    let output = "";
    try {
      output = await tryModel("gemini-2.5-flash", "v1");
    } catch (e: any) {
      console.log("⚠️ Primary model (gemini-2.5-flash) failed:", e.message); // now logs the REAL reason
      console.log("⚠️ Falling back to gemini-2.5-flash-lite...");
      output = await tryModel("gemini-2.5-flash-lite", "v1"); // gemini-1.5-flash is dead — replaced
    }

    const cleaned = output.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
    console.log("✅ Resume parsed:", cleaned.slice(0, 150));

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err: any) {
      console.log("⚠️ JSON parse failed, attempting repair:", err.message);
      parsed = JSON.parse(jsonrepair(cleaned));
    }

    const result = {
      name: parsed.name || "Candidate",
      email: parsed.email || "",
      phone: parsed.phone || "",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      summary: parsed.summary || "",
    };
    console.log("✅ Final:", JSON.stringify(result).slice(0, 150));
    return JSON.stringify(result);
  } catch (error: any) {
    console.error("❌ Resume Agent Error:", error.message);
    throw error;
  }
}