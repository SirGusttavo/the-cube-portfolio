"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/interface/BrandIcon";
import { ExternalLink, buttonClass } from "@/components/interface/ui";
import { profile } from "@/data/profile";
import { useI18n } from "@/i18n/I18nProvider";

const row =
  "flex items-center gap-3 rounded-lg border border-line/50 bg-white/[0.02] px-3 py-3 text-sm text-ink transition-colors hover:border-accent/60";

export function ContactApp() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponível: o e-mail continua clicável */
    }
  };

  return (
    <div className="space-y-4 p-6">
      <p className="text-sm text-ink-secondary">{t("contact.intro")}</p>
      <ul className="space-y-2">
        <li className="flex items-stretch gap-2">
          <a href={`mailto:${profile.email}`} className={`${row} min-w-0 flex-1`}>
            <Mail aria-hidden className="size-5 shrink-0 text-accent" />
            <span className="min-w-0">
              <span className="block text-[11px] text-ink-muted">
                {t("contact.email")}
              </span>
              <span className="block truncate">{profile.email}</span>
            </span>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className={`${buttonClass} shrink-0`}
            aria-label={t("contact.copyEmail")}
          >
            {copied ? (
              <Check aria-hidden className="size-4 text-success" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
            <span aria-live="polite">
              {copied ? t("common.copied") : t("common.copy")}
            </span>
          </button>
        </li>
        <li>
          <ExternalLink
            href={profile.linkedin}
            newTabLabel={t("common.newTab")}
            className={row}
          >
            <span
              aria-hidden
              className="grid size-5 place-items-center font-display text-sm font-bold text-accent"
            >
              in
            </span>
            {t("contact.linkedin")}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink
            href={profile.github}
            newTabLabel={t("common.newTab")}
            className={row}
          >
            <BrandIcon path={siGithub.path} className="size-5 text-accent" />
            {t("contact.github")}
          </ExternalLink>
        </li>
      </ul>
    </div>
  );
}
