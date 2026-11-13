"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Minus, X, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useWindows } from "@/contexts/WindowManager";
import { MOBILE_BREAKPOINT, type WinState } from "@/lib/windows/reducer";
import type { AppId } from "@/types/content";

interface WindowFrameProps {
  id: AppId;
  title: string;
  icon: LucideIcon;
  win: WinState;
  zIndex: number;
  focused: boolean;
  children: ReactNode;
}

const controlClass =
  "grid h-8 w-10 place-items-center text-ink-secondary transition-colors hover:bg-white/10 hover:text-ink focus-visible:outline-offset-[-3px]";

/**
 * Janela de aplicativo: barra de título arrastável (só no desktop), minimizar,
 * fechar e animações de entrada/saída. No celular ocupa a área útil inteira.
 */
export function WindowFrame({
  id,
  title,
  icon: Icon,
  win,
  zIndex,
  focused,
  children,
}: WindowFrameProps) {
  const { t } = useI18n();
  const wm = useWindows();
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  // Ao abrir ou restaurar, o foco do teclado entra na janela.
  const visible = !win.minimized && !win.closing;
  useEffect(() => {
    const el = frame.current;
    // Só puxa o foco se um filho (ex.: campo do terminal) ainda não o tiver.
    if (visible && el && !el.contains(document.activeElement))
      el.focus({ preventScroll: true });
  }, [visible]);

  // Fim da animação de saída: devolve o foco à barra de tarefas e remove a janela.
  const closing = win.closing;
  useEffect(() => {
    if (!closing) return;
    const finish = () => {
      document.querySelector<HTMLElement>(`[data-taskbar-app="${id}"]`)?.focus();
      wm.finalizeClose(id);
    };
    const timer = window.setTimeout(finish, 320); // rede de segurança se animationend não disparar
    const el = frame.current;
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "window-out") {
        window.clearTimeout(timer);
        finish();
      }
    };
    el?.addEventListener("animationend", onEnd);
    return () => {
      window.clearTimeout(timer);
      el?.removeEventListener("animationend", onEnd);
    };
  }, [closing, id, wm]);

  const onTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    wm.focus(id);
    if (window.innerWidth < MOBILE_BREAKPOINT) return;
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onTitlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const width = frame.current?.offsetWidth ?? 560;
    const x = Math.min(
      window.innerWidth - 120,
      Math.max(120 - width, e.clientX - drag.current.dx),
    );
    const y = Math.min(window.innerHeight - 80, Math.max(0, e.clientY - drag.current.dy));
    wm.move(id, x, y);
  };
  const onTitlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={frame}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      inert={win.minimized}
      aria-hidden={win.minimized || undefined}
      data-minimized={win.minimized}
      data-focused={focused}
      onPointerDown={() => !focused && wm.focus(id)}
      style={{ "--x": `${win.x}px`, "--y": `${win.y}px`, zIndex } as React.CSSProperties}
      className={[
        "window chrome fixed flex flex-col overflow-hidden rounded-xl border bg-[rgba(14,16,20,0.95)] outline-none",
        "inset-x-2 top-14 bottom-[4.75rem]",
        "md:inset-x-auto md:top-[var(--y)] md:bottom-auto md:left-[var(--x)] md:h-[min(560px,calc(100dvh-11rem))] md:w-[min(560px,calc(100vw-2rem))]",
        win.closing ? "window-exit" : "window-enter",
      ].join(" ")}
    >
      <div
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onPointerCancel={onTitlePointerUp}
        className="flex h-9 shrink-0 touch-none items-center justify-between border-b border-line/40 bg-white/[0.03] pl-3 select-none md:cursor-default"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            aria-hidden
            className={`size-4 shrink-0 ${focused ? "text-accent" : "text-ink-muted"}`}
          />
          <h2
            className={`truncate text-xs font-medium ${focused ? "text-ink" : "text-ink-secondary"}`}
          >
            {title}
          </h2>
        </div>
        <div className="flex">
          <button
            type="button"
            aria-label={t("window.minimize")}
            title={t("window.minimize")}
            onClick={() => wm.minimize(id)}
            className={controlClass}
          >
            <Minus aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t("window.close")}
            title={t("window.close")}
            onClick={() => wm.requestClose(id)}
            className={`${controlClass} hover:!bg-red-600 hover:!text-white`}
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}
