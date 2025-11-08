import { Html, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function SolarSystem3D({ onSelect }: { onSelect: (slug: string) => void }) {
  const { camera } = useThree();

  function flyTo(target: THREE.Vector3, radius: number) {
    const start = camera.position.clone();
    const dest = target.clone().add(new THREE.Vector3(radius * 18, radius * 8, radius * 18));
    let t = 0;
    const dur = 0.9;
    function step() {
      t += 1 / 60;
      const k = Math.min(1, t / dur);
      camera.position.lerpVectors(start, dest, k * (2 - k));
      camera.lookAt(target);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function Planet({ slug, color, radius, dist }: { slug: string; color: string; radius: number; dist: number }) {
    const pos = new THREE.Vector3(dist, 0, 0);
    const meshRef = useRef<THREE.Mesh>(null!);
    return (
      <group position={pos.toArray()}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            flyTo(pos, radius);
            onSelect(slug);
          }}
        >
          <sphereGeometry args={[Math.max(0.45, radius), 32, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Html center position={[0, radius + 0.8, 0]} style={{ pointerEvents: "none" }}>
          <div className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">{slug}</div>
        </Html>
      </group>
    );
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 8, 5]} intensity={1} />
      <Planet slug="mercury" color="#9ca3af" radius={0.6} dist={6} />
      <Planet slug="venus" color="#ffd166" radius={0.9} dist={8.5} />
      <Planet slug="earth" color="#6ee7b7" radius={1.0} dist={11} />
      <Planet slug="moon" color="#e5e7eb" radius={0.35} dist={12} />
      <Planet slug="mars" color="#ff6b6b" radius={0.8} dist={13.5} />
      <Planet slug="jupiter" color="#fca5a5" radius={2.5} dist={18} />
      <Planet slug="saturn" color="#fde68a" radius={2.1} dist={22} />
      <Planet slug="uranus" color="#93c5fd" radius={1.6} dist={25} />
      <Planet slug="neptune" color="#4ea8de" radius={1.6} dist={28} />
      <OrbitControls enablePan={false} />
    </>
  );
}
