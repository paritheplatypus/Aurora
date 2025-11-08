// src/api/gemini.ts
// Uses Vite env var: VITE_GEMINI_API_KEY
type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export async function genTourSteps(slug: string, md: string): Promise<string[]> {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("Missing VITE_GEMINI_API_KEY");

  const prompt = `Return STRICT JSON only: {"steps":["..."]}.
Create 6 short, engaging tour steps (<=28 words each) about "${slug}" for a space encyclopedia.
Keep them factual, kid-friendly, and avoid hype. Use this context:\n${md}`;

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + encodeURIComponent(key),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }]}]
      })
    }
  );
  const data = (await r.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

  // Some responses come back as a fenced block. Strip if present.
  const json = text.replace(/```json|```/g, "");
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed.steps)) throw new Error("Bad Gemini format");
  return parsed.steps;
}
