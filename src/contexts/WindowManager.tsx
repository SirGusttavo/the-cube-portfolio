"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { AppId } from "@/types/content";
import {
  initialWindowsState,
  windowsReducer,
  type WindowsState,
} from "@/lib/windows/reducer";

interface WindowManagerValue {
  state: WindowsState;
  open: (id: AppId) => void;
  toggle: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  restore: (id: AppId) => void;
  requestClose: (id: AppId) => void;
  finalizeClose: (id: AppId) => void;
  move: (id: AppId, x: number, y: number) => void;
  closeActive: () => void;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(windowsReducer, initialWindowsState);

  const open = useCallback(
    (id: AppId) => dispatch({ type: "open", id, viewport: viewport() }),
    [],
  );
  const toggle = useCallback(
    (id: AppId) => dispatch({ type: "toggle", id, viewport: viewport() }),
    [],
  );
  const focus = useCallback((id: AppId) => dispatch({ type: "focus", id }), []);
  const minimize = useCallback((id: AppId) => dispatch({ type: "minimize", id }), []);
  const restore = useCallback((id: AppId) => dispatch({ type: "restore", id }), []);
  const requestClose = useCallback(
    (id: AppId) => dispatch({ type: "requestClose", id }),
    [],
  );
  const finalizeClose = useCallback((id: AppId) => dispatch({ type: "close", id }), []);
  const move = useCallback(
    (id: AppId, x: number, y: number) => dispatch({ type: "move", id, x, y }),
    [],
  );
  const focused = state.focused;
  const closeActive = useCallback(() => {
    if (focused) dispatch({ type: "requestClose", id: focused });
  }, [focused]);

  const value = useMemo(
    () => ({
      state,
      open,
      toggle,
      focus,
      minimize,
      restore,
      requestClose,
      finalizeClose,
      move,
      closeActive,
    }),
    [
      state,
      open,
      toggle,
      focus,
      minimize,
      restore,
      requestClose,
      finalizeClose,
      move,
      closeActive,
    ],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindows(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindows precisa estar dentro de <WindowManagerProvider>");
  return ctx;
}
