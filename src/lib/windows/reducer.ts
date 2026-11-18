import type { AppId } from "@/types/content";

export const APP_IDS: readonly AppId[] = [
  "projects",
  "tech",
  "experience",
  "about",
  "terminal",
  "contact",
];

export interface Viewport {
  width: number;
  height: number;
}

export interface WinState {
  x: number;
  y: number;
  minimized: boolean;
  /** Animação de saída em andamento; `close` remove de fato. */
  closing: boolean;
}

export interface WindowsState {
  windows: Partial<Record<AppId, WinState>>;
  /** Ordem de empilhamento: do fundo (índice 0) para o topo. */
  order: AppId[];
  focused: AppId | null;
}

export type WindowsAction =
  | { type: "open"; id: AppId; viewport: Viewport }
  | { type: "toggle"; id: AppId; viewport: Viewport }
  | { type: "focus"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "restore"; id: AppId }
  | { type: "requestClose"; id: AppId }
  | { type: "close"; id: AppId }
  | { type: "move"; id: AppId; x: number; y: number };

export const MOBILE_BREAKPOINT = 768;
export const WINDOW_WIDTH = 560;

export const initialWindowsState: WindowsState = {
  windows: {},
  order: [],
  focused: null,
};

/** Posição inicial em cascata, ancorada à direita para o cubo continuar visível. */
export function defaultPosition(
  viewport: Viewport,
  index: number,
): { x: number; y: number } {
  if (viewport.width < MOBILE_BREAKPOINT) return { x: 0, y: 0 }; // celular: tela cheia via CSS
  const width = Math.min(WINDOW_WIDTH, viewport.width - 32);
  return {
    x: Math.max(16, viewport.width - width - 40 - index * 28),
    y: 72 + index * 28,
  };
}

function topVisible(
  order: AppId[],
  windows: WindowsState["windows"],
  except?: AppId,
): AppId | null {
  for (let i = order.length - 1; i >= 0; i--) {
    const id = order[i];
    if (id !== except && windows[id] && !windows[id]!.minimized && !windows[id]!.closing)
      return id;
  }
  return null;
}

function bringToFront(order: AppId[], id: AppId): AppId[] {
  return [...order.filter((o) => o !== id), id];
}

export function windowsReducer(state: WindowsState, action: WindowsAction): WindowsState {
  const { windows, order } = state;
  switch (action.type) {
    case "open": {
      const existing = windows[action.id];
      if (existing) {
        return {
          windows: {
            ...windows,
            [action.id]: { ...existing, minimized: false, closing: false },
          },
          order: bringToFront(order, action.id),
          focused: action.id,
        };
      }
      const pos = defaultPosition(action.viewport, order.length);
      return {
        windows: {
          ...windows,
          [action.id]: { ...pos, minimized: false, closing: false },
        },
        order: [...order, action.id],
        focused: action.id,
      };
    }
    case "toggle": {
      const w = windows[action.id];
      if (!w || w.closing)
        return windowsReducer(state, {
          type: "open",
          id: action.id,
          viewport: action.viewport,
        });
      if (w.minimized) return windowsReducer(state, { type: "restore", id: action.id });
      if (state.focused === action.id)
        return windowsReducer(state, { type: "minimize", id: action.id });
      return windowsReducer(state, { type: "focus", id: action.id });
    }
    case "focus": {
      const w = windows[action.id];
      if (!w || w.minimized || w.closing) return state;
      return { ...state, order: bringToFront(order, action.id), focused: action.id };
    }
    case "minimize": {
      const w = windows[action.id];
      if (!w) return state;
      const next = { ...windows, [action.id]: { ...w, minimized: true } };
      return { windows: next, order, focused: topVisible(order, next, action.id) };
    }
    case "restore": {
      const w = windows[action.id];
      if (!w) return state;
      return {
        windows: { ...windows, [action.id]: { ...w, minimized: false } },
        order: bringToFront(order, action.id),
        focused: action.id,
      };
    }
    case "requestClose": {
      const w = windows[action.id];
      if (!w || w.closing) return state;
      const next = { ...windows, [action.id]: { ...w, closing: true } };
      return {
        windows: next,
        order,
        focused:
          state.focused === action.id
            ? topVisible(order, next, action.id)
            : state.focused,
      };
    }
    case "close": {
      if (!windows[action.id]) return state;
      const next = { ...windows };
      delete next[action.id];
      const nextOrder = order.filter((o) => o !== action.id);
      return {
        windows: next,
        order: nextOrder,
        focused:
          state.focused === action.id ? topVisible(nextOrder, next) : state.focused,
      };
    }
    case "move": {
      const w = windows[action.id];
      if (!w) return state;
      return {
        ...state,
        windows: { ...windows, [action.id]: { ...w, x: action.x, y: action.y } },
      };
    }
  }
}

/**
 * Janelas abertas na ordem ESTÁVEL de renderização (a de APP_IDS), cada uma com
 * o z-index calculado a partir de `order`.
 *
 * Por que não renderizar em `order`: trazer uma janela para a frente reordenaria
 * os filhos no React, que MOVE o nó no DOM (remove e reinsere). Isso liberava a
 * captura de ponteiro no meio do `pointerdown`: o 1º arraste de qualquer janela
 * que não estava no topo falhava. Com ordem estável, focar só muda z-index
 * (verificado no navegador: sem mutação de DOM, scroll interno preservado e a
 * animação de entrada não se repete).
 */
export function windowLayout(
  state: WindowsState,
  baseZIndex = 20,
): Array<{ id: AppId; win: WinState; zIndex: number }> {
  return APP_IDS.flatMap((id) => {
    const win = state.windows[id];
    return win ? [{ id, win, zIndex: baseZIndex + state.order.indexOf(id) }] : [];
  });
}
