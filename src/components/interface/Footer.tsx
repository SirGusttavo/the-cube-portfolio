"use client";

import { Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "./BrandIcon";
import { Instructions } from "./Instructions";
import { profile } from "@/data/profile";
import { useI18n } from "@/i18n/I18nProvider";

const linkClass =
  "grid size-10 place-items-center rounded-lg border border-line/70 text-ink-secondary transition-colors hover:border-accent hover:text-accent";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-5 px-5 pt-6 pb-[4.5rem] md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4 md:px-10 md:pt-8 md:pb-20">
      <p className="hidden font-mono text-[10px] tracking-[0.3em] text-ink-muted uppercase md:block">
        {profile.tagline}
      </p>
      <div className="md:col-start-2 md:justify-self-center">
        <Instructions />
      </div>
      <nav
        aria-label={t("contact.title")}
        className="pointer-events-auto flex items-center gap-2 md:col-start-3 md:justify-self-end"
      >
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub (${t("common.newTab")})`}
          className={linkClass}
        >
          <BrandIcon path={siGithub.path} className="size-[18px]" />
        </a>
        {/* lucide-react 1.x e simple-icons não incluem a marca do LinkedIn; usamos o monograma "in". */}
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn (${t("common.newTab")})`}
          className={linkClass}
        >
          <span aria-hidden className="font-display text-[15px] leading-none font-bold">
            in
          </span>
        </a>
        <a
          href={`mailto:${profile.email}`}
          aria-label={`${t("contact.email")}: ${profile.email}`}
          className={linkClass}
        >
          <Mail aria-hidden className="size-[18px]" />
        </a>
      </nav>
    </footer>
  );
}
