"use client";

import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { CameraRig } from "./CameraRig";
import { CubeBase } from "./CubeBase";
import { CubeLighting } from "./CubeLighting";
import { CubeModel } from "./CubeModel";

export function CubeScene() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 16] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <CameraRig />
        <CubeLighting reducedMotion={reducedMotion} />
        <CubeBase />
        <CubeModel reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
