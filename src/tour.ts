// src/tour.ts
import { useCallback, useMemo, useState } from "react";
import entities from "../public/data/entities.json";
import { genTourSteps } from "./api/gemini";
import { speak } from "./api/voice";

type Entity = typeof entities[number];
type Style = "explorer" | "scientist" | "storyteller";
const STYLES: Style[] = ["explorer", "scientist", "storyteller"];

function getVisitCount(slug: string) {
  const n = parseInt(localStorage.getItem(`aurora:visits:${slug}`) || "0", 10);
  return isNaN(n) ? 0 : n;
}
function bumpVisitCount(slug: string) {
  const n = getVisitCount(slug) + 1;
  localStorage.setItem(`aurora:visits:${slug}`, String(n));
  return n;
}

export const useTour = (e?: Entity) => {
  const [steps, setSteps] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(-1);

  const slug = e?.slug ?? "unknown";
  const contextMD = e?.sections?.[0]?.md ?? "";

  // decide which style/variant to use for THIS visit (round-robin)
  const variantIndex = useMemo(() => {
    const visits = getVisitCount(slug);
    return visits % STYLES.length; // 0,1,2...
    // NOTE: bump happens when user clicks "Start"
  }, [slug]);
  const style = STYLES[variantIndex];

  const cacheKey = useMemo(
    () => `aurora:tour:${slug}:v${variantIndex}`, [slug, variantIndex]
  );

  const ensureAIGenerated = useCallback(async () => {
    if (!e) return;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setSteps(JSON.parse(cached));
      return;
    }
    const gen = await genTourSteps(slug, contextMD, style);
    setSteps(gen);
    localStorage.setItem(cacheKey, JSON.stringify(gen));

    // also keep a rolling list of used facts to reduce repeats across future variants
    const usedKey = `aurora:usedfacts:${slug}`;
    const used = new Set<string>(JSON.parse(localStorage.getItem(usedKey) || "[]"));
    gen.forEach(s => used.add(s.toLowerCase()));
    localStorage.setItem(usedKey, JSON.stringify([...used].slice(-60))); // cap
  }, [cacheKey, contextMD, e, slug, style]);

  const narrate = useCallback(async (i: number) => {
    try {
      if (i < 0 || i >= steps.length) return;
      const a = await speak(steps[i]);
      a.play();
    } catch { /* silent: offline/rate limits okay */ }
  }, [steps]);

  const start = useCallback(async () => {
    bumpVisitCount(slug);                 // mark a new visit → rotates next time
    if (!steps.length) await ensureAIGenerated();
    setActiveStep(0);
    await narrate(0);
  }, [ensureAIGenerated, narrate, steps.length, slug]);

  const next = useCallback(async () => {
    setActiveStep(prev => {
      const n = Math.min((prev < 0 ? 0 : prev) + 1, steps.length - 1);
      narrate(n);
      return n;
    });
  }, [narrate, steps.length]);

  const reset = useCallback(() => setActiveStep(-1), []);

  return { steps, activeStep, start, next, reset, ensureAIGenerated };
};
