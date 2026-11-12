import type { FaceId } from "@/types/content";

/**
 * Estado de interação compartilhado entre a árvore do R3F (que é outra raiz do
 * React e não enxerga Contexts da página) e o DOM (tooltip, cursor).
 * Um módulo singleton atravessa as duas raízes sem pontes.
 */
interface Pointer {
  face: FaceId | null;
  x: number;
  y: number;
}

let pointer: Pointer = { face: null, x: 0, y: 0 };
const listeners = new Set<() => void>();

export const interaction = {
  /** Flags não reativas, lidas dentro de handlers. */
  dragging: false,
  wasDrag: false,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getPointer: () => pointer,
  /** Snapshot primitivo: quem usa só re-renderiza quando a face muda. */
  getHoverFace: () => pointer.face,
  setHover(face: FaceId | null, x = pointer.x, y = pointer.y) {
    if (pointer.face === face && pointer.x === x && pointer.y === y) return;
    pointer = { face, x, y };
    listeners.forEach((l) => l());
  },
};
