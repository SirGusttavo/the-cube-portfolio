"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import {
  Briefcase,
  Cpu,
  FolderOpen,
  Mail,
  TerminalSquare,
  User,
  type LucideIcon,
} from "lucide-react";
import { AboutApp } from "@/components/panels/AboutApp";
import { ContactApp } from "@/components/panels/ContactApp";
import { ExperienceApp } from "@/components/panels/ExperienceApp";
import { TechApp } from "@/components/panels/TechApp";
import { useI18n } from "@/i18n/I18nProvider";
import type { AppId } from "@/types/content";

function Loading() {
  const { t } = useI18n();
  return <p className="p-5 text-sm text-ink-secondary">{t("common.loading")}</p>;
}

/** Os dois apps maiores carregam sob demanda, só quando a janela é aberta. */
const ProjectsApp = dynamic(
  () => import("@/components/projects/ProjectsApp").then((m) => m.ProjectsApp),
  { loading: Loading },
);
const TerminalApp = dynamic(
  () => import("@/components/terminal/TerminalApp").then((m) => m.TerminalApp),
  { loading: Loading },
);

export interface AppDefinition {
  icon: LucideIcon;
  Content: ComponentType;
}

export const APPS: Record<AppId, AppDefinition> = {
  projects: { icon: FolderOpen, Content: ProjectsApp },
  tech: { icon: Cpu, Content: TechApp },
  experience: { icon: Briefcase, Content: ExperienceApp },
  about: { icon: User, Content: AboutApp },
  terminal: { icon: TerminalSquare, Content: TerminalApp },
  contact: { icon: Mail, Content: ContactApp },
};

/** Ordem de exibição na barra de tarefas. */
export const TASKBAR_ORDER: readonly AppId[] = [
  "projects",
  "tech",
  "experience",
  "about",
  "terminal",
  "contact",
];
