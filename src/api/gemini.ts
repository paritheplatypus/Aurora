// src/api/gemini.ts
type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export async function genTourSteps(
  slug: string,
  md: string,
  style: "explorer" | "scientist" | "storyteller"
): Promise<string[]> {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("Missing VITE_GEMINI_API_KEY");

  const persona =
    style === "explorer"   ? "Curious guide, vivid but factual." :
    style === "scientist"  ? "Concise, data-oriented, precise values." :
                              "Gentle narrative, simple metaphors, still factual.";

  const prompt =
`Return STRICT JSON only: {"steps":["..."]}.
Create 6 short tour steps (<=28 words each) about "${slug}".
Voice: ${persona}
Avoid repeating identical facts across variants. Prefer lesser-known facts when possible.
Context:
${md}`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(key),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
    }
  );

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
  const json = text.replace(/```json|```/g, "");
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed.steps)) throw new Error("Bad Gemini format");
  return parsed.steps;
}
