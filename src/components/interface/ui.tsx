import type { ReactNode } from "react";
import { ExternalLink as ExternalIcon } from "lucide-react";

/** Link externo seguro, com indicação visual e para leitor de tela. */
export function ExternalLink({
  href,
  children,
  newTabLabel,
  className = "",
}: {
  href: string;
  children: ReactNode;
  newTabLabel: string;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <ExternalIcon aria-hidden className="ml-1.5 inline size-3.5 align-[-2px]" />
      <span className="sr-only"> ({newTabLabel})</span>
    </a>
  );
}

export const buttonClass =
  "inline-flex items-center gap-1 rounded-lg border border-line/70 px-3 py-1.5 text-xs text-ink transition-colors hover:border-accent hover:text-accent";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.22em] text-accent uppercase">
      {children}
    </p>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-line/60 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
      {children}
    </span>
  );
}
