"use client";

import { useEffect, useMemo } from "react";
import { Color, MeshStandardMaterial } from "three";
import type { BufferGeometry, LineBasicMaterial, EdgesGeometry } from "three";
import { palette } from "@/lib/palette";
import type { CubeBlockData } from "@/lib/cube/layout";

/**
 * Em PBR, a refletância de um metal vem da própria cor base. Com o grafite da
 * paleta (#171A20, ~1% linear) o bloco renderiza preto, sem reflexo algum.
 * Por isso o metal usa um grafite mais claro; a paleta segue valendo para a UI.
 */
const BASE_METAL = "#3c424d";

interface CubeBlockProps {
  block: CubeBlockData;
  geometry: BufferGeometry;
  edges: EdgesGeometry;
  edgeMaterial: LineBasicMaterial;
}

/**
 * Um bloco físico. Cada bloco tem material próprio porque a FASE 3 vai animar
 * emissão (hover/seleção) individualmente.
 */
export function CubeBlock({ block, geometry, edges, edgeMaterial }: CubeBlockProps) {
  const material = useMemo(() => {
    const accent = block.kind === "accent";
    const color = accent
      ? new Color(palette.accent).multiplyScalar(0.18)
      : new Color(BASE_METAL).offsetHSL(0, 0, block.tint * 0.02);
    return new MeshStandardMaterial({
      color,
      metalness: 0.65,
      roughness: 0.35 + block.roughnessJitter * 0.08,
      emissive: accent ? new Color(palette.accent) : new Color(0x000000),
      emissiveIntensity: accent ? 0.85 : 0,
    });
  }, [block]);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={block.position as [number, number, number]}>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edges} material={edgeMaterial} />
    </group>
  );
}
