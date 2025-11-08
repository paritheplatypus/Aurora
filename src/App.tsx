import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Stars, Sparkles, Telescope } from "lucide-react";
import entitiesData from "../public/data/entities.json";
import Starfield from "./components/Starfield";
import SolarSystem3D from "./modes/SolarSystem3D";
import { Canvas } from "@react-three/fiber";
import { Howler } from "howler";
import { useTour } from "./tour";
import { sfx } from "./sfx";

type Entity = typeof entitiesData[number];

function Card({ children }: { children: any }) {
  return <div className="glass rounded-xl p-4">{children}</div>;
}

function NarrationToggle() {
  const [on, setOn] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("aurora:narration") ?? "true");
    } catch {
      return true;
    }
  });
  useEffect(() => {
    localStorage.setItem("aurora:narration", JSON.stringify(on));
  }, [on]);
  return (
    <button className="rounded-md px-3 py-1 text-sm glass" onClick={() => setOn((v) => !v)}>
      {on ? "Narration: On" : "Narration: Off"}
    </button>
  );
}

function Nav({ onHome }: { onHome: () => void }) {
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("muted") || "false");
    } catch {
      return false;
    }
  });
  useEffect(() => {
    Howler.mute(muted);
    localStorage.setItem("muted", JSON.stringify(muted));
  }, [muted]);

  return (
    <div className="sticky top-0 z-40 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-white/90" />
          <button className="font-semibold tracking-wide" onClick={onHome}>
            AURORA
          </button>
        </div>
        <div className="flex items-center gap-2">
          <NarrationToggle />
          <button
            className="rounded-md px-3 py-1 text-sm glass hover:bg-white/10"
            onClick={() => setMuted((m) => !m)}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrbitScrubber({ color }: { color: string }) {
  const [angle, setAngle] = useState(0);
  const r = 100;
  const cx = 140,
    cy = 110;
  const rad = (angle * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  const dist = 1 + 0.3 * Math.cos(rad);

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">Orbit Scrubber</div>
        <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} />
      </div>
      <svg viewBox="0 0 300 220" className="h-56 w-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
        <circle cx={x} cy={y} r="14" fill={color} filter="url(#glow)" />
        <circle cx={cx} cy={cy} r="6" fill="white" />
      </svg>
      <div className="text-xs text-white/70">Scrub along the orbit. Dist factor: {dist.toFixed(2)}</div>
    </Card>
  );
}

function Entity({ slug, back }: { slug: string; back: () => void }) {
  const e: Entity | undefined = (entitiesData as any).find((x: Entity) => x.slug === slug);
  const { start, ensureAIGenerated, activeStep, steps, next, reset } = useTour(e);

  if (!e) return <div className="p-6">Not found.</div>;
  return (
    <section className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <button
        className="text-sm opacity-80 hover:opacity-100"
        onClick={() => {
          sfx.woosh.play();
          back();
        }}
      >
        ← Back
      </button>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-6 w-6 rounded-full" style={{ background: e.heroColor }} />
        <h2 className="text-2xl font-semibold">{e.title}</h2>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm text-white/70">{e.sections?.[0]?.md}</div>
        </Card>
        <OrbitScrubber color={e.heroColor} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          className="glass rounded px-3 py-1"
          onClick={async () => {
            await ensureAIGenerated();
            start();
            sfx.chime.play();
          }}
        >
          Start Guided Tour (AI)
        </button>
        {e.sources?.[0] && (
          <a className="text-xs opacity-70 hover:opacity-100" href={e.sources[0]} target="_blank">
            Source
          </a>
        )}
      </div>

      {/* Tour overlay */}
      {activeStep >= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass mx-4 max-w-lg rounded-xl p-4">
            <div className="text-sm opacity-80">
              Step {activeStep + 1} / {steps.length}
            </div>
            <div className="mt-2 text-lg">{steps[activeStep]}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="glass rounded px-3 py-1" onClick={() => reset()}>
                Close
              </button>
              <button
                className="glass rounded px-3 py-1"
                onClick={() => {
                  next();
                  sfx.woosh.play();
                }}
              >
                {activeStep + 1 === steps.length ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Home({ open, enter3D }: { open: (slug: string) => void; enter3D: () => void }) {
  const entities: Entity[] = entitiesData as any;

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-12 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> A serene interface for cosmic explorers
        </div>
        <h1 id="hero-title" className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Elegance among the{" "}
          <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
            stars
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/70 md:text-lg">Explore curated worlds—interactive, tactile, and fast.</p>
        <div className="mt-6">
          <button className="glass rounded px-4 py-2 text-sm" onClick={enter3D}>
            Launch 3D
          </button>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entities.map((e) => (
          <motion.button
            key={e.slug}
            onClick={() => {
              sfx.woosh.play();
              open(e.slug);
            }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-left"
          >
            <Card>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ background: `radial-gradient(circle at 40% 35%, ${e.heroColor}, transparent 60%), #1b2340` }}
                />
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-white/60">{e.tags?.join(" • ")}</div>
                </div>
              </div>
            </Card>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <Telescope className="h-4 w-4" />
            Deep Sky Mode
          </div>
          <p className="mt-2 text-sm text-white/70">Glassy dark theme with soft gradients.</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Stars className="h-4 w-4" />
            Orbital Layouts
          </div>
          <p className="mt-2 text-sm text-white/70">Radial grouping and orbit rings.</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Parallax Flow
          </div>
          <p className="mt-2 text-sm text-white/70">Subtle motion cues to guide attention.</p>
        </Card>
      </div>
    </section>
  );
}

export default function App() {
  const [interactive, setInteractive] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0c19] via-[#0a0d1f] to-[#0b1024]">
      <Starfield />
      <Nav onHome={() => { setSlug(null); setInteractive(false); }} />

      {/* 3D overlay */}
      {interactive && (
        <div className="fixed inset-0 z-30">
          <Canvas camera={{ position: [0, 6, 26], fov: 45 }}>
            <SolarSystem3D
              onSelect={(s) => {
                setInteractive(false);
                setSlug(s);
              }}
            />
          </Canvas>
          <div className="pointer-events-none absolute inset-x-0 top-2 z-40 flex justify-center">
            <div className="pointer-events-auto glass rounded px-3 py-1 text-xs">Click a planet to open details</div>
          </div>
        </div>
      )}

      {slug ? <Entity slug={slug} back={() => setSlug(null)} /> : <Home open={setSlug} enter3D={() => setInteractive(true)} />}

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-white/70">© {new Date().getFullYear()} Aurora Interface Lab</div>
      </footer>
    </div>
  );
}
