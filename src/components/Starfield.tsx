import { useMemo } from "react";

export default function Starfield() {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; size: number; o: number }[] = [];
    const total = 600;
    for (let i = 0; i < total; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.2 + 0.2,
        o: 0.5 + Math.random() * 0.5,
      });
    }
    return arr;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.size} fill="white" opacity={s.o} />
        ))}
      </svg>
    </div>
  );
}
