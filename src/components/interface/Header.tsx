"use client";

import { Logo } from "./Logo";
import { profile } from "@/data/profile";
import { useI18n } from "@/i18n/I18nProvider";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 md:px-10 md:py-8">
      <div className="flex items-center gap-4">
        <Logo className="size-9 text-accent" />
        <div className="h-8 w-px bg-line" aria-hidden />
        <div className="leading-tight">
          <p className="font-display text-sm font-medium tracking-[0.22em] text-ink uppercase">
            {profile.name}
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-ink-muted uppercase">
            {t("header.role")}
          </p>
        </div>
      </div>
    </header>
  );
}
