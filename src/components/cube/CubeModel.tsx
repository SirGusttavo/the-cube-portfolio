"use client";

import { useEffect, useMemo, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from "three";
import type { Group } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { palette } from "@/lib/palette";
import type { FaceId } from "@/types/content";
import { buildCubeBlocks } from "@/lib/cube/layout";
import {
  BLOCK_RADIUS,
  BLOCK_SIZE,
  CUBE_Y,
  FLOAT_AMPLITUDE,
  FLOAT_PERIOD,
  INITIAL_YAW,
  TILT,
} from "@/lib/cube/constants";
import { CubeBlock } from "./CubeBlock";

interface CubeModelProps {
  /** Grupo cuja rotação é controlada pelo CubeController. */
  groupRef: RefObject<Group | null>;
  reducedMotion: boolean;
  onSelectFace?: (face: FaceId) => void;
}

/** Geometria e flutuação. A rotação (automática e manual) é do CubeController. */
export function CubeModel({ groupRef, reducedMotion, onSelectFace }: CubeModelProps) {
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

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const float = reducedMotion
      ? 0
      : Math.sin((state.clock.elapsedTime * Math.PI * 2) / FLOAT_PERIOD) *
        FLOAT_AMPLITUDE;
    g.position.y = CUBE_Y + float;
  });

  return (
    <group ref={groupRef} rotation={[TILT, INITIAL_YAW, 0]} position={[0, CUBE_Y, 0]}>
      {blocks.map((block) => (
        <CubeBlock
          key={block.id}
          block={block}
          geometry={geometry}
          edges={edges}
          edgeMaterial={edgeMaterial}
          onSelectFace={onSelectFace}
        />
      ))}
    </group>
  );
}
