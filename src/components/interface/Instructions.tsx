import { ChevronLeft, ChevronRight, Mouse } from "lucide-react";

/** "DRAG" para ponteiro fino (mouse), "SWIPE" para toque. Decidido por CSS, sem JS. */
export function Instructions() {
  return (
    <p className="flex items-center gap-3 whitespace-nowrap font-mono text-[11px] tracking-[0.28em] text-ink-secondary uppercase">
      <ChevronLeft
        aria-hidden
        className="size-4 animate-nudge text-accent [animation-direction:reverse]"
      />
      <Mouse aria-hidden className="size-4 pointer-coarse:hidden" />
      <span className="pointer-coarse:hidden">Drag to explore</span>
      <span className="hidden pointer-coarse:inline">Swipe to explore</span>
      <ChevronRight aria-hidden className="size-4 animate-nudge text-accent" />
    </p>
  );
}
