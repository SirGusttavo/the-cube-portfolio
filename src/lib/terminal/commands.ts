import { education, experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { techCategoryOrder, technologies } from "@/data/technologies";
import {
  LOCALES,
  isLocale,
  translate,
  type Locale,
  type TKey,
  type Translate,
} from "@/i18n";
import { APP_IDS } from "@/lib/windows/reducer";
import type { AppId } from "@/types/content";

/**
 * Interpretador do terminal. É uma tabela fechada de comandos que só LEEM dados
 * do portfólio: nada de eval, shell, rede ou execução arbitrária.
 */
export const COMMAND_NAMES = [
  "help",
  "about",
  "projects",
  "skills",
  "experience",
  "education",
  "contact",
  "github",
  "clear",
  "date",
  "whoami",
  "open",
  "lang",
] as const;
export type CommandName = (typeof COMMAND_NAMES)[number];

export type TerminalAction =
  { type: "open"; app: AppId } | { type: "clear" } | { type: "locale"; locale: Locale };

export interface CommandResult {
  lines: string[];
  error?: boolean;
  action?: TerminalAction;
}

export interface CommandContext {
  t: Translate;
  locale: Locale;
  now: Date;
}

const LOCALE_ALIASES: Record<string, Locale> = {
  pt: "pt-BR",
  "pt-br": "pt-BR",
  ptbr: "pt-BR",
  en: "en",
  "en-us": "en",
};

function parseLocale(arg: string): Locale | null {
  const key = arg.toLowerCase();
  return LOCALE_ALIASES[key] ?? (isLocale(arg) ? arg : null);
}

const isCommand = (name: string): name is CommandName =>
  (COMMAND_NAMES as readonly string[]).includes(name);
const isApp = (name: string): name is AppId =>
  (APP_IDS as readonly string[]).includes(name);

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const [rawName = "", ...args] = input.trim().split(/\s+/);
  if (rawName === "") return { lines: [] };
  const name = rawName.toLowerCase();
  const { t } = ctx;

  if (!isCommand(name))
    return { lines: [t("terminal.unknown", { cmd: rawName })], error: true };

  switch (name) {
    case "help":
      return {
        lines: [
          t("terminal.helpHeader"),
          ...COMMAND_NAMES.map((c) => `  ${c.padEnd(11)} ${t(`terminal.cmd.${c}`)}`),
          "",
          t("terminal.helpShortcuts"),
        ],
      };
    case "about":
      return { lines: [t("about.p1"), t("about.p2"), t("about.p3")] };
    case "whoami":
      return { lines: [`${profile.name} — ${t("header.role")}`] };
    case "projects":
      return {
        lines: projects.flatMap((p) => [
          `${p.name} — ${t(`projects.${p.textKey}.tagline`)} [${t(`projects.kinds.${p.kind}`)}]`,
          `  ${p.repository}`,
        ]),
      };
    case "skills":
      return {
        lines: techCategoryOrder.map(
          (c) =>
            `${t(`tech.categories.${c}`)}: ${technologies
              .filter((x) => x.category === c)
              .map((x) => x.name)
              .join(", ")}`,
        ),
      };
    case "experience":
      return {
        lines: experience.flatMap((e) => [
          `${e.organization} — ${t("experience.current.role")}`,
          `  ${t("experience.current.area")}`,
          `  ${t("experience.current.period")}`,
        ]),
      };
    case "education":
      return {
        lines: education.map((e) => {
          const note =
            e.textKey === "cruzeiro" ? ` (${t("experience.cruzeiroNote")})` : "";
          return `${t(`experience.${e.textKey}`)} — ${e.institution}${note}`;
        }),
      };
    case "contact":
      return {
        lines: [
          `${t("contact.email")}: ${profile.email}`,
          `${t("contact.linkedin")}: ${profile.linkedin}`,
          `${t("contact.github")}: ${profile.github}`,
        ],
      };
    case "github":
      return { lines: [profile.github, projects[0].repository] };
    case "date":
      return {
        lines: [
          new Intl.DateTimeFormat(ctx.locale, {
            dateStyle: "full",
            timeStyle: "medium",
          }).format(ctx.now),
        ],
      };
    case "clear":
      return { lines: [], action: { type: "clear" } };
    case "open": {
      const target = args[0]?.toLowerCase();
      if (!target) return { lines: [t("terminal.usageOpen")], error: true };
      if (!isApp(target))
        return {
          lines: [t("terminal.noSuchApp", { app: args[0] }), t("terminal.usageOpen")],
          error: true,
        };
      return {
        lines: [t("terminal.opening", { app: t(`apps.${target}`) })],
        action: { type: "open", app: target },
      };
    }
    case "lang": {
      const next = args[0] ? parseLocale(args[0]) : null;
      if (!next) return { lines: [t("terminal.usageLang")], error: true };
      // A confirmação já sai no idioma novo.
      const language = translate(next, `language.${next}` as TKey);
      return {
        lines: [translate(next, "terminal.langChanged", { language })],
        action: { type: "locale", locale: next },
      };
    }
  }
}

/** Candidatos de autocompletar (linhas completas). */
export function completeCommand(input: string): string[] {
  const match = /^(\S*)(\s+(\S*))?$/.exec(input.trimStart());
  if (!match) return [];
  const [, first, spaced, second = ""] = match;
  if (!spaced) return COMMAND_NAMES.filter((c) => c.startsWith(first.toLowerCase()));
  const lower = second.toLowerCase();
  if (first.toLowerCase() === "open")
    return APP_IDS.filter((a) => a.startsWith(lower)).map((a) => `open ${a}`);
  if (first.toLowerCase() === "lang")
    return LOCALES.filter((l) => l.toLowerCase().startsWith(lower)).map(
      (l) => `lang ${l}`,
    );
  return [];
}
