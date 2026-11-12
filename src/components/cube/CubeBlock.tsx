"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Color, MeshStandardMaterial } from "three";
import type { Mesh } from "three";
import type { BufferGeometry, EdgesGeometry, LineBasicMaterial } from "three";
import { palette } from "@/lib/palette";
import { interaction } from "@/lib/cube/interactionStore";
import {
  faceIdFromPosition,
  facePositionFromNormal,
  type CubeBlockData,
} from "@/lib/cube/layout";
import { CLICK_THRESHOLD_MOUSE } from "@/lib/cube/constants";
import type { FaceId } from "@/types/content";

/**
 * Em PBR, a refletância de um metal vem da própria cor base. Com o grafite da
 * paleta (#171A20, ~1% linear) o bloco renderiza preto, sem reflexo algum.
 * Por isso o metal usa um grafite mais claro; a paleta segue valendo para a UI.
 */
const BASE_METAL = "#3c424d";
const ACCENT_EMISSION = 0.85;
const HOVER_EMISSION = 0.35;

interface CubeBlockProps {
  block: CubeBlockData;
  geometry: BufferGeometry;
  edges: EdgesGeometry;
  edgeMaterial: LineBasicMaterial;
  onSelectFace?: (face: FaceId) => void;
}

/** Face atingida pelo raio, a partir da normal local; cai na 1ª face do bloco se não bater. */
function faceFromEvent(
  e: ThreeEvent<MouseEvent | PointerEvent>,
  block: CubeBlockData,
): FaceId {
  const n = e.face?.normal;
  if (!n) return block.faces[0];
  const id = faceIdFromPosition(facePositionFromNormal(n.x, n.y, n.z));
  return block.faces.includes(id) ? id : block.faces[0];
}

/**
 * Um bloco físico. Material próprio porque a emissão (hover, destaque) é
 * individual. O realce de hover vale para a face inteira que o bloco integra.
 */
export function CubeBlock({
  block,
  geometry,
  edges,
  edgeMaterial,
  onSelectFace,
}: CubeBlockProps) {
  const accent = block.kind === "accent";

  const material = useMemo(() => {
    const color = accent
      ? new Color(palette.accent).multiplyScalar(0.18)
      : new Color(BASE_METAL).offsetHSL(0, 0, block.tint * 0.02);
    return new MeshStandardMaterial({
      color,
      metalness: 0.65,
      roughness: 0.35 + block.roughnessJitter * 0.08,
      emissive: new Color(palette.accent),
      emissiveIntensity: accent ? ACCENT_EMISSION : 0,
    });
  }, [block, accent]);

  useEffect(() => () => material.dispose(), [material]);

  const hoverFace = useSyncExternalStore(
    interaction.subscribe,
    interaction.getHoverFace,
    () => null,
  );
  const hovered = hoverFace !== null && block.faces.includes(hoverFace);
  const level = useRef(0);
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const target = hovered ? 1 : 0;
    if (Math.abs(target - level.current) < 0.002 && level.current === target) return;
    level.current +=
      (target - level.current) * (1 - Math.exp(-Math.min(delta, 0.1) * 12));
    if (Math.abs(target - level.current) < 0.002) level.current = target;
    const m = mesh.current?.material as MeshStandardMaterial | undefined;
    if (m)
      m.emissiveIntensity =
        (accent ? ACCENT_EMISSION : 0) + level.current * HOVER_EMISSION;
  });

  return (
    <group position={block.position as [number, number, number]}>
      <mesh
        ref={mesh}
        geometry={geometry}
        material={material}
        onPointerMove={(e) => {
          if (e.pointerType === "touch" || interaction.dragging) return;
          e.stopPropagation();
          interaction.setHover(faceFromEvent(e, block), e.clientX, e.clientY);
        }}
        onPointerOut={() => interaction.setHover(null)}
        onClick={(e) => {
          // delta = px entre pointerdown e click; wasDrag vem do controlador.
          if (e.delta > CLICK_THRESHOLD_MOUSE * 2 || interaction.wasDrag) return;
          e.stopPropagation();
          onSelectFace?.(faceFromEvent(e, block));
        }}
      />
      <lineSegments geometry={edges} material={edgeMaterial} />
    </group>
  );
}
