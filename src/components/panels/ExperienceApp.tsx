"use client";

import { FileDown } from "lucide-react";
import { Eyebrow, buttonClass } from "@/components/interface/ui";
import { education, experience } from "@/data/experience";
import { useI18n } from "@/i18n/I18nProvider";

export const RESUME_FILES = {
  "pt-BR": "/resume/gustavo-morais-pt-BR.pdf",
  en: "/resume/gustavo-morais-en.pdf",
} as const;

export function ExperienceApp() {
  const { t } = useI18n();
  return (
    <div className="space-y-6 p-6">
      {experience.map((job) => (
        <section key={job.id} className="space-y-2">
          <Eyebrow>{t("experience.title")}</Eyebrow>
          <h3 className="font-display text-xl font-semibold text-ink">
            {job.organization}
          </h3>
          <p className="text-sm text-ink">{t("experience.current.role")}</p>
          <p className="text-sm text-ink-secondary">{t("experience.current.area")}</p>
          <p className="font-mono text-xs text-ink-muted">
            {t("experience.current.period")}
          </p>
          <div className="pt-2">
            <p className="text-[11px] text-ink-muted">{t("experience.deliverables")}</p>
            <p className="text-sm text-ink-secondary">
              {t("experience.deliverableFlow")}
            </p>
          </div>
        </section>
      ))}

      <section className="space-y-3">
        <Eyebrow>{t("experience.education")}</Eyebrow>
        <ul className="space-y-3">
          {education.map((e) => (
            <li key={e.id} className="border-l-2 border-accent/60 pl-3">
              <p className="text-sm text-ink">{t(`experience.${e.textKey}`)}</p>
              <p className="text-xs text-ink-secondary">{e.institution}</p>
              {e.textKey === "cruzeiro" && (
                <p className="font-mono text-[11px] text-ink-muted">
                  {t("experience.cruzeiroNote")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <Eyebrow>{t("experience.resume")}</Eyebrow>
        <p className="text-xs text-ink-secondary">{t("experience.resumeHint")}</p>
        <div className="flex flex-wrap gap-2">
          <a href={RESUME_FILES["pt-BR"]} download className={buttonClass}>
            <FileDown aria-hidden className="size-4" />
            {t("experience.resumePt")}
          </a>
          <a href={RESUME_FILES.en} download className={buttonClass}>
            <FileDown aria-hidden className="size-4" />
            {t("experience.resumeEn")}
          </a>
        </div>
      </section>
    </div>
  );
}
