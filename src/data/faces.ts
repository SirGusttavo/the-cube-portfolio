import type { CubeFaceConfig } from "@/types/content";

/**
 * Mapeamento face → janela. Rótulos e dicas vêm de i18n (`faces.<id>.*`).
 * PLAYGROUND abre o terminal: o espaço de experimentos é interativo.
 */
export const faces: readonly CubeFaceConfig[] = [
  { id: "projects", index: 1, position: "front", app: "projects" },
  { id: "tech", index: 2, position: "top", app: "tech" },
  { id: "experience", index: 3, position: "right", app: "experience" },
  { id: "about", index: 4, position: "left", app: "about" },
  { id: "playground", index: 5, position: "bottom", app: "terminal" },
  { id: "contact", index: 6, position: "back", app: "contact" },
];
