"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from "three";
import type { Group } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { palette } from "@/lib/palette";
import { buildCubeBlocks } from "@/lib/cube/layout";
import {
  AUTO_ROTATION_SPEED,
  BLOCK_RADIUS,
  BLOCK_SIZE,
  CUBE_Y,
  FLOAT_AMPLITUDE,
  FLOAT_PERIOD,
  INITIAL_YAW,
  TILT,
} from "@/lib/cube/constants";
import { CubeBlock } from "./CubeBlock";

export function CubeModel({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const yaw = useRef(INITIAL_YAW);

  const blocks = useMemo(() => buildCubeBlocks(), []);
  const geometry = useMemo(
    () => new RoundedBoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, 3, BLOCK_RADIUS),
    [],
  );
  const edges = useMemo(() => {
    const box = new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const result = new EdgesGeometry(box);
    box.dispose();
    return result;
  }, []);
  const edgeMaterial = useMemo(
    () =>
      new LineBasicMaterial({ color: palette.border, transparent: true, opacity: 0.3 }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      edges.dispose();
      edgeMaterial.dispose();
    },
    [geometry, edges, edgeMaterial],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // Limita o delta: ao voltar de uma aba em segundo plano ele pode ser enorme.
    const dt = Math.min(delta, 0.1);
    if (!reducedMotion) yaw.current += dt * AUTO_ROTATION_SPEED;
    const t = state.clock.elapsedTime;
    const float = reducedMotion
      ? 0
      : Math.sin((t * Math.PI * 2) / FLOAT_PERIOD) * FLOAT_AMPLITUDE;
    const sway = reducedMotion ? 0 : Math.sin(t * 0.7) * 0.012;
    g.rotation.set(TILT, yaw.current, sway);
    g.position.y = CUBE_Y + float;
  });

  return (
    <group ref={group} rotation={[TILT, INITIAL_YAW, 0]} position={[0, CUBE_Y, 0]}>
      {blocks.map((block) => (
        <CubeBlock
          key={block.id}
          block={block}
          geometry={geometry}
          edges={edges}
          edgeMaterial={edgeMaterial}
        />
      ))}
    </group>
  );
}
