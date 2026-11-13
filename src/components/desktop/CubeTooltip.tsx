"use client";

import { useSyncExternalStore } from "react";
import { faces } from "@/data/faces";
import { useI18n } from "@/i18n/I18nProvider";
import { interaction } from "@/lib/cube/interactionStore";

const serverPointer = { face: null, x: 0, y: 0 } as const;

/** Identificador flutuante perto do cursor: "01 / PROJETOS". Só aparece com mouse. */
export function CubeTooltip() {
  const { t } = useI18n();
  const p = useSyncExternalStore(
    interaction.subscribe,
    interaction.getPointer,
    () => serverPointer,
  );
  if (!p.face) return null;
  const face = faces.find((f) => f.id === p.face)!;
  return (
    <div
      role="presentation"
      className="chrome pointer-events-none fixed z-[15] rounded-lg border border-line/70 bg-[rgba(12,14,18,0.92)] px-3 py-2 shadow-lg"
      style={{ left: `min(${p.x + 18}px, calc(100vw - 220px))`, top: p.y + 18 }}
    >
      <p className="font-mono text-[10px] tracking-[0.2em] text-accent">
        {String(face.index).padStart(2, "0")} / {t(`faces.${face.id}.label`)}
      </p>
      <p className="text-xs text-ink-secondary">{t(`faces.${face.id}.hint`)}</p>
    </div>
  );
}
