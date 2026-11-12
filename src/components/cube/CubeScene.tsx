"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import type { Group } from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { FaceId } from "@/types/content";
import { CameraRig } from "./CameraRig";
import { CubeBase } from "./CubeBase";
import { CubeController } from "./CubeController";
import { CubeLighting } from "./CubeLighting";
import { CubeModel } from "./CubeModel";

interface CubeSceneProps {
  ariaLabel: string;
  onSelectFace?: (face: FaceId) => void;
}

export function CubeScene({ ariaLabel, onSelectFace }: CubeSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const cube = useRef<Group>(null);

  return (
    // Elemento focável: recebe arraste, roda e setas. `touch-none` impede o
    // navegador de roubar o gesto de arrastar no celular.
    <div
      ref={root}
      tabIndex={0}
      role="group"
      aria-label={ariaLabel}
      className="absolute inset-0 cursor-grab touch-none outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-6 active:cursor-grabbing"
    >
      <Canvas
        aria-hidden
        dpr={[1, 2]}
        camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 16] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <CameraRig />
        <CubeLighting reducedMotion={reducedMotion} />
        <CubeBase />
        <CubeController target={cube} root={root} reducedMotion={reducedMotion} />
        <CubeModel
          groupRef={cube}
          reducedMotion={reducedMotion}
          onSelectFace={onSelectFace}
        />
      </Canvas>
    </div>
  );
}
