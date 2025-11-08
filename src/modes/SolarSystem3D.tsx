import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
// at top of SolarSystem3D.tsx
import { useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";

// inside component:
const { camera } = useThree();
function flyTo(target = new Vector3(0,0,0), radius = 10) {
  const dest = target.clone().add(new Vector3(radius*1.8, radius*0.8, radius*1.8));
  const start = camera.position.clone();
  let t = 0;
  const dur = 0.9;
  const animate = (dt: number) => {
    t += dt;
    const k = Math.min(1, t / dur);
    camera.position.lerpVectors(start, dest, MathUtils.smootherstep(k,0,1));
    camera.lookAt(target);
    if (k < 1) requestAnimationFrame(()=>animate(1/60));
  };
  animate(0);
}

type Entity = {
  slug: string;
  title: string;
  heroColor: string;
  tags?: string[];
  facts?: { radius_km?: number };
};

type Props = {
  entities: Entity[];
  onSelect: (slug: string) => void;
  onExit: () => void;
};

const KM_TO_UNITS = 1 / 50000;
const DEFAULTS: Record<string, { color: string; distAU: number; radiusKm: number }> = {
  sun: { color: "#ffdd55", distAU: 0, radiusKm: 696340 },
  mercury: { color: "#9ca3af", distAU: 0.39, radiusKm: 2439.7 },
  venus: { color: "#ffd166", distAU: 0.72, radiusKm: 6051.8 },
  earth: { color: "#6ee7b7", distAU: 1.0, radiusKm: 6371 },
  moon: { color: "#e5e7eb", distAU: 1.0026, radiusKm: 1737.4 },
  mars: { color: "#ff6b6b", distAU: 1.52, radiusKm: 3389.5 },
  jupiter: { color: "#fca5a5", distAU: 5.2, radiusKm: 69911 },
  saturn: { color: "#fde68a", distAU: 9.58, radiusKm: 58232 },
  uranus: { color: "#93c5fd", distAU: 19.2, radiusKm: 25362 },
  neptune: { color: "#4ea8de", distAU: 30.1, radiusKm: 24622 },
  pluto: { color: "#a78bfa", distAU: 39.5, radiusKm: 1188.3 },
  europa: { color: "#7dd3fc", distAU: 5.2, radiusKm: 1560.8 },
  titan: { color: "#f5a524", distAU: 9.58, radiusKm: 2574.7 }
};

function Orbit({ radius }: { radius: number }) {
  const ring = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(256).map(p => new THREE.Vector3(p.x, 0, p.y));
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [radius]);
  return (
    <line>
      <bufferGeometry attach="geometry" {...(ring as any)} />
      <lineBasicMaterial attach="material" linewidth={1} color="white" opacity={0.15} transparent />
    </line>
  );
}

function Planet({
  slug,
  color,
  distance,
  radius,
  onClick
}: {
  slug: string;
  color: string;
  distance: number;
  radius: number;
  onClick: (slug: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });
  return (
    <group position={[distance, 0, 0]}>
      <mesh
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onClick(slug); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.05} metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function SolarSystem3D({ entities, onSelect, onExit }: Props) {
  const planets = useMemo(() => {
    const seen = new Set<string>();
    const list: { slug: string; color: string; dist: number; radius: number }[] = [];
    list.push({
      slug: "sun",
      color: DEFAULTS.sun.color,
      dist: 0,
      radius: DEFAULTS.sun.radiusKm * KM_TO_UNITS * 0.2
    });

    for (const e of entities) {
      const slug = e.slug.toLowerCase();
      if (seen.has(slug)) continue;
      const base = DEFAULTS[slug] ?? { color: e.heroColor || "#ffffff", distAU: 5, radiusKm: e.facts?.radius_km ?? 3000 };
      seen.add(slug);
      list.push({
        slug,
        color: base.color,
        dist: base.distAU * 10,
        radius: Math.max(0.4, base.radiusKm * KM_TO_UNITS)
      });
    }
    return list.sort((a, b) => a.dist - b.dist);
  }, [entities]);

  return (
    <div className="absolute inset-0 z-30">
      <div className="pointer-events-auto absolute left-4 top-4 z-40">
        <div className="glass rounded-lg px-3 py-2 text-xs">
          <div className="font-semibold">Interactive Mode</div>
          <div className="opacity-80 mt-1">Drag to orbit • Scroll to zoom • Click a body to open</div>
          <button className="mt-2 glass rounded px-2 py-1" onClick={onExit}>Exit</button>
        </div>
      </div>

      <Canvas camera={{ position: [0, 25, 60], fov: 55 }}>
        <Stars radius={300} depth={60} count={8000} factor={4} saturation={0} fade />
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={2.2} color={"#fff4c2"} />

        <mesh>
          <sphereGeometry args={[planets[0].radius, 64, 64]} />
          <meshBasicMaterial color={DEFAULTS.sun.color} />
        </mesh>

        {planets.slice(1).map((p) => (
          <group key={p.slug}>
            <Orbit radius={p.dist} />
            <Planet slug={p.slug} color={p.color} distance={p.dist} radius={p.radius} onClick={onSelect} />
          </group>
        ))}

        <OrbitControls enableDamping dampingFactor={0.08} rotateSpeed={0.6} zoomSpeed={0.6} />
      </Canvas>
    </div>
  );
}
