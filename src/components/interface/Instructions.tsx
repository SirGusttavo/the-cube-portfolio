"use client";

import { ChevronLeft, ChevronRight, Mouse } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/** "Arraste" para ponteiro fino (mouse), "Deslize" para toque. Decidido por CSS, sem JS. */
export function Instructions() {
  const { t } = useI18n();
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] whitespace-nowrap text-ink-secondary uppercase">
      <ChevronLeft
        aria-hidden
        className="size-4 animate-nudge text-accent [animation-direction:reverse]"
      />
      <Mouse aria-hidden className="size-4 pointer-coarse:hidden" />
      <span className="pointer-coarse:hidden">{t("cube.drag")}</span>
      <span className="hidden pointer-coarse:inline">{t("cube.swipe")}</span>
      <ChevronRight aria-hidden className="size-4 animate-nudge text-accent" />
    </p>
  );
}
