"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/interface/ui";
import { projects } from "@/data/projects";
import { techCategoryOrder, technologies } from "@/data/technologies";
import { useI18n } from "@/i18n/I18nProvider";

export function TechApp() {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = technologies.find((x) => x.id === selectedId);
  const usedIn = selected?.usedIn
    ?.map((id) => projects.find((p) => p.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="space-y-5 p-6">
      <p className="text-xs text-ink-secondary">{t("tech.intro")}</p>

      {techCategoryOrder.map((category) => (
        <section
          key={category}
          aria-labelledby={`tech-${category}`}
          className="space-y-2"
        >
          <Eyebrow>
            <span id={`tech-${category}`}>{t(`tech.categories.${category}`)}</span>
          </Eyebrow>
          <ul className="flex flex-wrap gap-2">
            {technologies
              .filter((x) => x.category === category)
              .map((tech) => {
                const active = tech.id === selectedId;
                return (
                  <li key={tech.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedId(active ? null : tech.id)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? "border-accent bg-accent/10 text-ink"
                          : "border-line/60 text-ink-secondary hover:border-accent/60 hover:text-ink"
                      }`}
                    >
                      {tech.name}
                      {tech.usedIn && (
                        <>
                          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                          <span className="sr-only">({t("tech.professionalBadge")})</span>
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}

      <div
        aria-live="polite"
        className="min-h-14 rounded-lg border border-line/50 bg-white/[0.02] p-3 text-sm"
      >
        {selected ? (
          <>
            <p className="font-medium text-ink">{selected.name}</p>
            <p className="text-xs text-ink-secondary">
              {t(`tech.categories.${selected.category}`)}
            </p>
            {usedIn && usedIn.length > 0 && (
              <p className="mt-1 text-xs text-ink-secondary">
                <span className="text-accent">{t("tech.professionalBadge")}</span> ·{" "}
                {t("tech.usedIn")}: {usedIn.join(", ")}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-ink-muted">{t("tech.selectHint")}</p>
        )}
      </div>
      <p className="text-[11px] text-ink-muted">
        <span
          aria-hidden
          className="mr-1.5 inline-block size-1.5 rounded-full bg-accent align-middle"
        />
        {t("tech.legend")}
      </p>
    </div>
  );
}
