import { describe, expect, it } from "vitest";
import { faces } from "@/data/faces";
import { BLOCK_SIZE, CUBE_EXTENT, GAP, PITCH } from "./constants";
import { buildCubeBlocks, faceIdFromPosition, facePositionFromNormal } from "./layout";
import { cameraDistance } from "./camera";

const blocks = buildCubeBlocks();

describe("buildCubeBlocks", () => {
  it("gera 56 blocos visíveis, sem o miolo 2×2×2", () => {
    expect(blocks).toHaveLength(56);
    const inner = blocks.filter((b) => b.grid.every((i) => i === 1 || i === 2));
    expect(inner).toHaveLength(0);
  });

  it("tem ids únicos", () => {
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
  });

  it("cada face funcional tem exatamente 16 blocos", () => {
    for (const face of faces) {
      expect(blocks.filter((b) => b.faces.includes(face.id))).toHaveLength(16);
    }
  });

  it("distribui 8 vértices (3 faces), 24 arestas (2) e 24 centros (1)", () => {
    const by = (n: number) => blocks.filter((b) => b.faces.length === n).length;
    expect([by(3), by(2), by(1)]).toEqual([8, 24, 24]);
  });

  it("respeita tamanho do bloco, espaçamento e aresta total", () => {
    expect(PITCH).toBeCloseTo(BLOCK_SIZE + GAP, 10);
    const maxCoord = Math.max(...blocks.flatMap((b) => b.gridPosition.map(Math.abs)));
    expect(maxCoord + BLOCK_SIZE / 2).toBeCloseTo(CUBE_EXTENT / 2, 10);
    expect(CUBE_EXTENT).toBeCloseTo(3.54, 2);
  });

  it("tem um detalhe laranja por face, sempre em bloco de centro", () => {
    const accents = blocks.filter((b) => b.kind === "accent");
    expect(accents).toHaveLength(6);
    for (const a of accents) expect(a.faces).toHaveLength(1);
    expect(new Set(accents.map((a) => a.faces[0])).size).toBe(6);
  });

  it("preserva a silhueta: arestas e vértices nunca são deslocados", () => {
    for (const b of blocks.filter((x) => x.faces.length > 1)) {
      expect(b.depthOffset).toBe(0);
      expect(b.position).toEqual(b.gridPosition);
    }
  });

  it("mantém os deslocamentos pequenos (< metade do espaçamento de bloco)", () => {
    for (const b of blocks) expect(Math.abs(b.depthOffset)).toBeLessThan(BLOCK_SIZE / 4);
  });

  it("é determinístico", () => {
    expect(buildCubeBlocks()).toEqual(blocks);
  });
});

describe("cameraDistance", () => {
  it("afasta a câmera em telas estreitas", () => {
    expect(cameraDistance(0.46, 35)).toBeGreaterThan(cameraDistance(1.6, 35));
  });

  it("em desktop, o limite é a altura; em retrato, a largura", () => {
    const halfTan = Math.tan((35 * Math.PI) / 360);
    expect(cameraDistance(1.6, 35)).toBeCloseTo(9.8 / (2 * halfTan), 6);
    expect(cameraDistance(0.46, 35)).toBeCloseTo(7.2 / (0.46 * 2 * halfTan), 6);
  });
});

describe("facePositionFromNormal", () => {
  it("usa o eixo dominante", () => {
    expect(facePositionFromNormal(0, 0, 1)).toBe("front");
    expect(facePositionFromNormal(0.1, 0.2, -0.9)).toBe("back");
    expect(facePositionFromNormal(-0.8, 0.3, 0.2)).toBe("left");
    expect(facePositionFromNormal(0.9, -0.1, 0.1)).toBe("right");
    expect(facePositionFromNormal(0.2, 0.95, 0.1)).toBe("top");
    expect(facePositionFromNormal(0, -1, 0)).toBe("bottom");
  });

  it("cada posição corresponde a uma face funcional", () => {
    expect(faceIdFromPosition("front")).toBe("projects");
    expect(faceIdFromPosition("bottom")).toBe("playground");
  });
});
