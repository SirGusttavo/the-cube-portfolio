"use client";

import { useState, type KeyboardEvent } from "react";
import { Info } from "lucide-react";
import { Chip, Eyebrow, ExternalLink, buttonClass } from "@/components/interface/ui";
import { projects } from "@/data/projects";
import { useI18n } from "@/i18n/I18nProvider";
import type { TKey } from "@/i18n";
import type { Project, ProjectModule } from "@/types/content";
import { GithubPanel } from "./GithubPanel";

const TABS = [...projects.map((p) => p.id), "github"] as const;
type TabId = (typeof TABS)[number];

/** Notas por módulo que existem nos dicionários (VISCONF e Techlyst). */
const MODULE_NOTES: Partial<Record<ProjectModule["id"], TKey[]>> = {
  visconf: ["projects.flow.modules.visconf.note1", "projects.flow.modules.visconf.note2"],
  techlyst: ["projects.flow.modules.techlyst.note1"],
};

const textKey = (p: Project, field: "tagline" | "summary") =>
  `projects.${p.textKey}.${field}` as TKey;

export function ProjectsApp() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("flow");

  // Navegação por setas entre abas (padrão WAI-ARIA tabs).
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.indexOf(tab);
    const next =
      e.key === "ArrowRight"
        ? i + 1
        : e.key === "ArrowLeft"
          ? i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? TABS.length - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    const id = TABS[(next + TABS.length) % TABS.length];
    setTab(id);
    document.getElementById(`ptab-${id}`)?.focus();
  };

  const project = projects.find((p) => p.id === tab);

  return (
    <div className="flex h-full flex-col">
      <div
        role="tablist"
        aria-label={t("projects.tabsLabel")}
        onKeyDown={onTabKey}
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-line/40 px-3 pt-2"
      >
        {TABS.map((id) => {
          const active = id === tab;
          const label =
            id === "github" ? "GitHub" : projects.find((p) => p.id === id)!.name;
          return (
            <button
              key={id}
              id={`ptab-${id}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls="ppanel"
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-t-lg border-b-2 px-3 py-2 text-xs whitespace-nowrap transition-colors ${
                active
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        id="ppanel"
        role="tabpanel"
        aria-labelledby={`ptab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto p-5"
      >
        {tab === "github" ? (
          <>
            <Eyebrow>{t("github.title")}</Eyebrow>
            <div className="mt-3">
              <GithubPanel />
            </div>
          </>
        ) : project ? (
          project.modules ? (
            <FlowDetail project={project} />
          ) : (
            <SimpleDetail project={project} />
          )
        ) : null}
      </div>
    </div>
  );
}

function Header({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <header className="space-y-1">
      <Eyebrow>{t(`projects.kinds.${project.kind}`)}</Eyebrow>
      <h3 className="font-display text-2xl font-semibold text-ink">{project.name}</h3>
      <p className="text-sm text-ink-secondary">{t(textKey(project, "tagline"))}</p>
    </header>
  );
}

function SimpleDetail({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <Header project={project} />
      <p className="text-sm leading-relaxed text-ink">{t(textKey(project, "summary"))}</p>
      {project.kind === "fork" && (
        <p
          role="note"
          className="flex gap-2 rounded-lg border border-accent/40 bg-accent/5 p-3 text-xs text-ink-secondary"
        >
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          {t("projects.pip.credit")}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <ExternalLink
          href={project.repository}
          newTabLabel={t("common.newTab")}
          className={buttonClass}
        >
          {t("common.viewRepo")}
        </ExternalLink>
        {project.originalRepository && (
          <ExternalLink
            href={project.originalRepository}
            newTabLabel={t("common.newTab")}
            className={buttonClass}
          >
            {t("projects.labels.original")}
          </ExternalLink>
        )}
      </div>
    </div>
  );
}

function FlowDetail({ project }: { project: Project }) {
  const { t } = useI18n();
  const modules = project.modules!;
  const [moduleId, setModuleId] = useState<ProjectModule["id"]>(modules[0].id);
  const current = modules.find((m) => m.id === moduleId)!;
  const base = `projects.flow.modules.${current.id}` as const;
  const notes = MODULE_NOTES[current.id] ?? [];

  return (
    <div className="space-y-5">
      <Header project={project} />
      <p className="text-sm leading-relaxed text-ink">{t("projects.flow.summary")}</p>

      <p
        role="note"
        className="flex gap-2 rounded-lg border border-accent/40 bg-accent/5 p-3 text-xs text-ink-secondary"
      >
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
        {t("projects.flow.notice")}
      </p>

      {project.technologies && (
        <section aria-label={t("projects.labels.technologies")} className="space-y-2">
          <Eyebrow>{t("projects.labels.technologies")}</Eyebrow>
          <ul className="flex flex-wrap gap-1.5">
            {project.technologies.map((name) => (
              <li key={name}>
                <Chip>{name}</Chip>
              </li>
            ))}
            <li>
              <Chip>{t("projects.labels.parallel")}</Chip>
            </li>
          </ul>
        </section>
      )}

      <section aria-label={t("projects.labels.modules")} className="space-y-2">
        <Eyebrow>
          {t("projects.labels.modules")} · {modules.length}
        </Eyebrow>
        <ul className="grid grid-cols-2 gap-2">
          {modules.map((m, i) => {
            const active = m.id === moduleId;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setModuleId(m.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-line/50 bg-white/[0.02] hover:border-accent/60"
                  }`}
                >
                  <span className="block font-mono text-[10px] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="block text-sm text-ink">{m.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-live="polite"
        className="space-y-3 rounded-lg border border-line/50 bg-white/[0.02] p-4"
      >
        <h4 className="font-display text-lg text-ink">{current.name}</h4>
        <div>
          <p className="text-[11px] text-ink-muted">{t("projects.labels.application")}</p>
          <p className="text-sm text-ink-secondary">{t(`${base}.application` as TKey)}</p>
        </div>
        <div>
          <p className="text-[11px] text-ink-muted">{t("projects.labels.result")}</p>
          <p className="font-mono text-sm text-accent">{t(`${base}.result` as TKey)}</p>
        </div>
        {notes.length > 0 && (
          <div>
            <p className="text-[11px] text-ink-muted">{t("projects.labels.notes")}</p>
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-ink-secondary">
              {notes.map((n) => (
                <li key={n}>{t(n)}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <p className="text-[11px] text-ink-muted">{t("projects.flow.resultsNote")}</p>

      <ExternalLink
        href={project.repository}
        newTabLabel={t("common.newTab")}
        className={buttonClass}
      >
        {t("common.viewRepo")}
      </ExternalLink>
    </div>
  );
}
