"use client";

import { profile } from "@/data/profile";
import { useI18n } from "@/i18n/I18nProvider";
import { Eyebrow } from "@/components/interface/ui";

export function AboutApp() {
  const { t } = useI18n();
  const [first, ...rest] = profile.name.split(" ");
  return (
    <article className="space-y-4 p-6">
      <Eyebrow>{t("header.role")}</Eyebrow>
      <h3 className="font-display text-3xl leading-tight font-semibold text-ink">
        {first}
        <br />
        <span className="text-accent">{rest.join(" ")}</span>
      </h3>
      <p className="text-sm leading-relaxed text-ink">{t("about.p1")}</p>
      <p className="text-sm leading-relaxed text-ink-secondary">{t("about.p2")}</p>
      <p className="text-sm leading-relaxed text-ink-secondary">{t("about.p3")}</p>
    </article>
  );
}
