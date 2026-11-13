"use client";

import { Logo } from "@/components/interface/Logo";
import { useI18n } from "@/i18n/I18nProvider";
import { useWindows } from "@/contexts/WindowManager";
import { APPS, TASKBAR_ORDER } from "@/components/windows/apps";
import { Clock } from "./Clock";
import { LanguageSelect } from "./LanguageSelect";

export function Taskbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { t } = useI18n();
  const { state, toggle } = useWindows();

  return (
    <nav
      aria-label={t("taskbar.label")}
      className="chrome fixed inset-x-2 bottom-2 z-50 mx-auto flex max-w-fit items-center gap-1 overflow-x-auto rounded-2xl border border-line/60 bg-[rgba(12,14,18,0.86)] px-2 py-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.8)] md:bottom-3"
    >
      <button
        type="button"
        onClick={onOpenPalette}
        aria-label={t("taskbar.start")}
        title={t("taskbar.start")}
        aria-haspopup="dialog"
        className="grid size-10 shrink-0 place-items-center rounded-lg text-accent transition-colors hover:bg-white/10"
      >
        <Logo className="size-6" />
      </button>
      <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line/60" />

      {TASKBAR_ORDER.map((id) => {
        const { icon: Icon } = APPS[id];
        const win = state.windows[id];
        const isOpen = !!win && !win.closing;
        const isFocused = state.focused === id;
        const name = t(`apps.${id}`);
        const label = isOpen
          ? t("taskbar.openWindow", { app: name })
          : t("taskbar.open", { app: name });
        return (
          <button
            key={id}
            type="button"
            data-taskbar-app={id}
            aria-label={label}
            aria-pressed={isFocused}
            title={name}
            onClick={() => toggle(id)}
            className={`relative grid size-10 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/10 ${
              isFocused ? "bg-white/[0.07] text-ink" : "text-ink-secondary hover:text-ink"
            }`}
          >
            <Icon aria-hidden className="size-5" />
            <span
              aria-hidden
              className={`absolute bottom-0.5 h-[3px] rounded-full transition-all duration-200 ${
                isFocused
                  ? "w-4 bg-accent"
                  : isOpen
                    ? "w-1.5 bg-ink-muted"
                    : "w-0 bg-transparent"
              }`}
            />
          </button>
        );
      })}

      <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line/60" />
      <LanguageSelect />
      <Clock />
    </nav>
  );
}
