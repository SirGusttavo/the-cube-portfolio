"use client";

import { AlertTriangle } from "lucide-react";
import { Chip, ExternalLink, buttonClass } from "@/components/interface/ui";
import { projects } from "@/data/projects";
import { useGithubRepos } from "@/hooks/useGithubRepos";
import { useI18n } from "@/i18n/I18nProvider";
import type { RepoSummary } from "@/lib/github";

/** Reserva quando a API falha e não há cache: só o que já está nos dados locais. */
const localFallback: RepoSummary[] = projects.map((p) => ({
  name: p.repository.split("/").pop() ?? p.name,
  url: p.repository,
  description: null,
  language: null,
  updatedAt: "",
  fork: p.kind === "fork",
}));

export function GithubPanel() {
  const { t, locale } = useI18n();
  const { result, retry } = useGithubRepos();
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, opts).format(new Date(iso));

  if (result === null) {
    return (
      <p role="status" className="text-sm text-ink-secondary">
        {t("github.loading")}
      </p>
    );
  }

  const repos = result.status === "error" ? localFallback : result.repos;

  return (
    <div className="space-y-3">
      {result.status !== "ok" && (
        <div
          role="alert"
          className="flex gap-2 rounded-lg border border-accent/40 bg-accent/5 p-3 text-xs text-ink-secondary"
        >
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          <div className="space-y-1">
            <p className="text-ink">{t(`github.errors.${result.error}`)}</p>
            <p>
              {result.status === "stale"
                ? t("github.stale", {
                    when: fmt(result.fetchedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }),
                  })
                : t("github.fallback")}
            </p>
            <button type="button" onClick={retry} className={`${buttonClass} mt-1`}>
              {t("common.retry")}
            </button>
          </div>
        </div>
      )}

      {repos.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("github.none")}</p>
      ) : (
        <ul className="space-y-2">
          {repos.map((r) => (
            <li
              key={r.url}
              className="rounded-lg border border-line/50 bg-white/[0.02] p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ExternalLink
                  href={r.url}
                  newTabLabel={t("common.newTab")}
                  className="text-sm font-medium text-ink hover:text-accent"
                >
                  {r.name}
                </ExternalLink>
                {r.fork && <Chip>{t("github.fork")}</Chip>}
                {r.language && <Chip>{r.language}</Chip>}
              </div>
              {r.description && (
                <p className="mt-1 text-xs text-ink-secondary">{r.description}</p>
              )}
              {r.updatedAt && (
                <p className="mt-1 font-mono text-[11px] text-ink-muted">
                  {t("github.updated", {
                    date: fmt(r.updatedAt, { dateStyle: "medium" }),
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
