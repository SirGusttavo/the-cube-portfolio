import { useEffect, useRef } from "react";
import type { AppId } from "@/types/content";

/** Ctrl/⌘/Alt + 1–4. */
export const DIGIT_APPS: Record<string, AppId> = {
  Digit1: "projects",
  Digit2: "tech",
  Digit3: "experience",
  Digit4: "terminal",
};

interface Handlers {
  togglePalette: () => void;
  openApp: (id: AppId) => void;
  closeActive: () => void;
  paletteOpen: boolean;
}

export function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

/**
 * Atalhos globais. Só combinações com modificador disparam em qualquer lugar
 * (não são digitação). Esc fecha a janela ativa, mas dentro de um campo de
 * texto apenas tira o foco, para não descartar o que a pessoa digitava.
 *
 * Atenção: Ctrl+1…4 são reservados pelos navegadores (trocar de aba) e muitas
 * vezes nem chegam à página; Alt+1…4 é a alternativa confiável.
 */
export function useGlobalShortcuts(handlers: Handlers) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const h = ref.current;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        h.togglePalette();
        return;
      }

      const app = DIGIT_APPS[e.code];
      if (app && (mod || e.altKey) && !e.shiftKey && !h.paletteOpen) {
        e.preventDefault();
        h.openApp(app);
        return;
      }

      if (e.key === "Escape" && !e.defaultPrevented && !h.paletteOpen) {
        if (isTextField(e.target)) {
          (e.target as HTMLElement).blur();
          return;
        }
        h.closeActive();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
