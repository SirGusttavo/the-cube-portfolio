"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { PointLight } from "three";
import { palette } from "@/lib/palette";

const CORE_BASE = 14;
const CORE_AMPLITUDE = 5;
const CORE_PERIOD = 3.2; // s

/**
 * Luz principal laranja, secundária neutra, ambiente discreto e um núcleo
 * pulsante no miolo oco do cubo. O Environment é procedural (Lightformers):
 * sem HDR externo, sem requisição de rede. Ele existe porque metal sem
 * reflexo de ambiente renderiza quase preto.
 */
export function CubeLighting({ reducedMotion }: { reducedMotion: boolean }) {
  const core = useRef<PointLight>(null);

  useFrame((state) => {
    if (!core.current) return;
    const pulse = reducedMotion
      ? 0
      : Math.sin((state.clock.elapsedTime * Math.PI * 2) / CORE_PERIOD);
    core.current.intensity = CORE_BASE + pulse * CORE_AMPLITUDE;
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 6, 4]} intensity={4} color={palette.accentLight} />
      <directionalLight position={[-6, 2, 5]} intensity={2.4} color="#c9ced8" />
      <directionalLight position={[0, 3, -6]} intensity={1.6} color="#8b93a1" />
      <pointLight
        ref={core}
        position={[0, 0, 0]}
        color={palette.accent}
        intensity={CORE_BASE}
        distance={9}
        decay={2}
      />

      <Environment resolution={128} frames={1} environmentIntensity={1.3}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color={palette.accentLight}
          position={[5, 3, 2]}
          scale={[6, 3, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#d7dbe4"
          position={[-5, 2, 4]}
          scale={[5, 2, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#ffffff"
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 3, 1]}
        />
      </Environment>
    </>
  );
}
