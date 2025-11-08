// src/tour.ts
import { useCallback, useMemo, useState } from "react";
import entitiesData from "../public/data/entities.json";
import { genTourSteps } from "./api/gemini";
import { speak } from "./api/voice";

type Entity = typeof entitiesData[number];

type UseTour = (e?: Entity) => {
  steps: string[];
  activeStep: number; // -1 means hidden
  start: () => Promise<void>;
  next: () => Promise<void>;
  reset: () => void;
  ensureAIGenerated: () => Promise<void>;
};

export const useTour: UseTour = (e?: Entity) => {
  const [steps, setSteps] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(-1);

  const slug = e?.slug ?? "unknown";
  const contextMD = e?.sections?.[0]?.md ?? "";
  const cacheKey = useMemo(() => `aurora:tour:${slug}`, [slug]);

  const ensureAIGenerated = useCallback(async () => {
    if (!e) return;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setSteps(JSON.parse(cached));
      return;
    }
    const gen = await genTourSteps(slug, contextMD);
    setSteps(gen);
    localStorage.setItem(cacheKey, JSON.stringify(gen));
  }, [cacheKey, contextMD, e, slug]);

  const narrate = useCallback(async (i: number) => {
    try {
      if (i < 0 || i >= steps.length) return;
      const a = await speak(steps[i]);
      a.play();
    } catch {
      // ignore narration errors (offline, rate limit, etc.)
    }
  }, [steps]);

  const start = useCallback(async () => {
    if (!steps.length) await ensureAIGenerated();
    setActiveStep(0);
    await narrate(0);
  }, [ensureAIGenerated, narrate, steps.length]);

  const next = useCallback(async () => {
    setActiveStep(prev => {
      const n = Math.min((prev < 0 ? 0 : prev) + 1, steps.length - 1);
      // fire-and-forget narration
      narrate(n);
      return n;
    });
  }, [narrate, steps.length]);

  const reset = useCallback(() => setActiveStep(-1), []);

  return { steps, activeStep, start, next, reset, ensureAIGenerated };
};
