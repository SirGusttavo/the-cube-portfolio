import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { LOCALES, type Locale, type TKey, type Translate } from "@/i18n";
import { DIGIT_APPS_BY_APP } from "@/lib/palette/shortcuts";
import { APP_IDS } from "@/lib/windows/reducer";
import type { AppId } from "@/types/content";

export interface PaletteItem {
  id: string;
  label: string;
  group: "apps" | "actions" | "language";
  keywords?: string;
  shortcut?: string;
  run: () => void;
}

export interface PaletteActions {
  openApp: (id: AppId) => void;
  openUrl: (url: string) => void;
  setLocale: (locale: Locale) => void;
  resumeUrl: (locale: Locale) => string;
}

/** Tudo que a central pode abrir: áreas, currículo, GitHub e idioma. */
export function buildPaletteItems(
  t: Translate,
  locale: Locale,
  actions: PaletteActions,
  altLabel: string,
): PaletteItem[] {
  const apps: PaletteItem[] = APP_IDS.map((id) => {
    const digit = DIGIT_APPS_BY_APP[id];
    return {
      id: `app-${id}`,
      group: "apps",
      label: t("palette.openApp", { app: t(`apps.${id}`) }),
      keywords: `${id} ${t(`apps.${id}`)}`,
      shortcut: digit ? `${altLabel}+${digit}` : undefined,
      run: () => actions.openApp(id),
    };
  });

  const flow = projects[0];
  const actionItems: PaletteItem[] = [
    {
      id: "resume",
      group: "actions",
      label: t("palette.resume"),
      keywords: t("palette.resumeKeywords"),
      run: () => actions.openUrl(actions.resumeUrl(locale)),
    },
    {
      id: "repo",
      group: "actions",
      label: t("palette.repo"),
      keywords: "flow github repositorio repository",
      run: () => actions.openUrl(flow.repository),
    },
    {
      id: "profile",
      group: "actions",
      label: t("palette.profile"),
      keywords: "github perfil profile",
      run: () => actions.openUrl(profile.github),
    },
  ];

  const languages: PaletteItem[] = LOCALES.map((l) => ({
    id: `lang-${l}`,
    group: "language",
    label: t("palette.switchTo", { language: t(`language.${l}` as TKey) }),
    keywords: t("palette.languageKeywords"),
    run: () => actions.setLocale(l),
  }));

  return [...apps, ...actionItems, ...languages];
}
