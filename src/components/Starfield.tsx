import { useMemo } from "react";

export default function Starfield() {
  const stars = useMemo(() => {
    const arr = [];
    const total = 500;
    for (let i = 0; i < total; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.1 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        dur: 2 + Math.random() * 4,
        delay: Math.random() * 5,
      });
    }
    return arr;
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-[60rem] w-[60rem] rounded-full bg-[radial-gradient(closest-side,rgba(120,119,198,0.25),rgba(0,0,0,0))] blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-[50rem] w-[50rem] rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.18),rgba(0,0,0,0))] blur-3xl" />
      <svg className="absolute inset-0 w-full h-full">
        {Array.from({ length: 500 }).map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 1.1 + 0.3;
          const opacity = Math.random() * 0.7 + 0.3;
          const dur = 2 + Math.random() * 4;
          const delay = Math.random() * 5;
          return (
            <circle
              key={i}
              cx={`${x}vw`}
              cy={`${y}vh`}
              r={size}
              fill="white"
              style={{
                opacity,
                animation: `twinkle ${dur}s ease-in-out ${delay}s infinite alternate`,
                filter: "drop-shadow(0 0 2px rgba(255,255,255,0.5))",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
