"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { palette } from "@/lib/palette";

/**
 * PLACEHOLDER DA FASE 1. Existe só para provar que Three.js + R3F + React 19 +
 * Next funcionam juntos. Será substituído pelo cubo modular real na Fase 2.
 */
function PlaceholderBox() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08 * Math.PI;
  });
  return (
    <mesh ref={ref} rotation={[0.5, 0.6, 0]}>
      <boxGeometry args={[3.6, 3.6, 3.6]} />
      <meshStandardMaterial color={palette.surface} metalness={0.65} roughness={0.35} />
    </mesh>
  );
}

export function CubeScene() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas dpr={[1, 2]} camera={{ fov: 35, position: [0, 0, 14] }}>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[4, 5, 6]}
          intensity={2}
          color={palette.accentLight}
        />
        <PlaceholderBox />
      </Canvas>
    </div>
  );
}
