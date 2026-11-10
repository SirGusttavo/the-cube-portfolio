import { faces } from "@/data/faces";
import type { FaceId, FacePosition } from "@/types/content";
import { mulberry32 } from "@/lib/random";
import { DIVISIONS, LAYOUT_SEED, PITCH } from "./constants";

export type Vec3 = readonly [number, number, number];

export const FACE_NORMALS: Record<FacePosition, Vec3> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  right: [1, 0, 0],
  left: [-1, 0, 0],
};

export interface CubeBlockData {
  id: string;
  /** Índice inteiro 0..DIVISIONS-1 em cada eixo. */
  grid: Vec3;
  /** Posição na grade, sem deslocamento. Base para animações de "explosão". */
  gridPosition: Vec3;
  /** Posição de repouso: grade + deslocamento de profundidade. */
  position: Vec3;
  /** Faces funcionais que este bloco toca (1 = centro, 2 = aresta, 3 = vértice). */
  faces: FaceId[];
  kind: "dark" | "accent";
  /** -1..1: variação de luminosidade da cor base. */
  tint: number;
  /** -1..1: variação de rugosidade. */
  roughnessJitter: number;
  /** Quanto o bloco avança (+) ou recua (−) ao longo da normal da sua face. */
  depthOffset: number;
}

const ACCENT_DEPTH = -0.14;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Gera os 56 blocos visíveis (os 8 do miolo 2×2×2 nunca aparecem, então não
 * existem). Determinístico: depende apenas de LAYOUT_SEED.
 *
 * Só blocos de centro de face (1 face) recebem deslocamento ou destaque, para
 * preservar a silhueta do cubo (arestas e vértices ficam sempre alinhados).
 */
export function buildCubeBlocks(): CubeBlockData[] {
  const rand = mulberry32(LAYOUT_SEED);
  const last = DIVISIONS - 1;
  const half = last / 2;
  const idByPosition = new Map<FacePosition, FaceId>(
    faces.map((f) => [f.position, f.id]),
  );
  const blocks: CubeBlockData[] = [];
  const centersByFace = new Map<FaceId, CubeBlockData[]>();

  for (let x = 0; x < DIVISIONS; x++) {
    for (let y = 0; y < DIVISIONS; y++) {
      for (let z = 0; z < DIVISIONS; z++) {
        const touched: FacePosition[] = [];
        if (x === last) touched.push("right");
        if (x === 0) touched.push("left");
        if (y === last) touched.push("top");
        if (y === 0) touched.push("bottom");
        if (z === last) touched.push("front");
        if (z === 0) touched.push("back");
        if (touched.length === 0) continue; // miolo: invisível

        // Sempre 3 sorteios por bloco, para a sequência não depender do ramo.
        const tint = rand() * 2 - 1;
        const roughnessJitter = rand() * 2 - 1;
        const offsetT = rand();

        const gridPosition: Vec3 = [
          (x - half) * PITCH,
          (y - half) * PITCH,
          (z - half) * PITCH,
        ];
        const isCenter = touched.length === 1;
        const depthOffset = isCenter ? lerp(-0.04, 0.06, offsetT) : 0;

        const block: CubeBlockData = {
          id: `${x}-${y}-${z}`,
          grid: [x, y, z],
          gridPosition,
          position: gridPosition,
          faces: touched.map((p) => idByPosition.get(p)!),
          kind: "dark",
          tint,
          roughnessJitter,
          depthOffset,
        };
        blocks.push(block);
        if (isCenter) {
          const list = centersByFace.get(block.faces[0]) ?? [];
          list.push(block);
          centersByFace.set(block.faces[0], list);
        }
      }
    }
  }

  // Um detalhe laranja recuado por face, escolhido de forma determinística.
  for (const face of faces) {
    const candidates = centersByFace.get(face.id) ?? [];
    if (candidates.length === 0) continue;
    candidates[Math.floor(rand() * candidates.length)].kind = "accent";
  }

  const normalOf = (b: CubeBlockData): Vec3 => {
    const pos = faces.find((f) => f.id === b.faces[0])!.position;
    return FACE_NORMALS[pos];
  };

  return blocks.map((b) => {
    if (b.faces.length !== 1) return b;
    const depthOffset = b.kind === "accent" ? ACCENT_DEPTH : b.depthOffset;
    const n = normalOf(b);
    const position: Vec3 = [
      b.gridPosition[0] + n[0] * depthOffset,
      b.gridPosition[1] + n[1] * depthOffset,
      b.gridPosition[2] + n[2] * depthOffset,
    ];
    return { ...b, depthOffset, position };
  });
}
