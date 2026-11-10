"use client";

import { useEffect, useMemo } from "react";
import { AdditiveBlending, CanvasTexture } from "three";
import { palette } from "@/lib/palette";
import { BASE_Y } from "@/lib/cube/constants";

/** Base circular luminosa: halo suave + dois anéis finos. Não acompanha a flutuação do cubo. */
export function CubeBase() {
  const glow = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(255,121,0,0.55)");
    g.addColorStop(0.45, "rgba(255,121,0,0.16)");
    g.addColorStop(1, "rgba(255,121,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new CanvasTexture(canvas);
  }, []);

  useEffect(() => () => glow.dispose(), [glow]);

  return (
    <group position={[0, BASE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[4.6, 64]} />
        <meshBasicMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[2.55, 2.58, 128]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[3.5, 3.52, 128]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
