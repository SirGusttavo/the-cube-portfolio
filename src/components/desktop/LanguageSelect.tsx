"use client";

import { Globe } from "lucide-react";
import { LOCALES, isLocale } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";

/** <select> nativo: acessível por padrão e escala para novos idiomas sem código extra. */
export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className="relative flex h-9 items-center gap-1.5 rounded-lg px-2 text-ink-secondary transition-colors focus-within:outline-2 focus-within:outline-accent hover:bg-white/10 hover:text-ink">
      <Globe aria-hidden className="size-4" />
      <span className="sr-only">{t("taskbar.language")}</span>
      <select
        value={locale}
        title={t("taskbar.language")}
        onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent font-mono text-[11px] uppercase outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={l} className="bg-surface text-ink">
            {l === "pt-BR" ? "PT" : l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
