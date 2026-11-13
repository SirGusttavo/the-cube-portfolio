"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { RESUME_FILES } from "@/components/panels/ExperienceApp";
import { useWindows } from "@/contexts/WindowManager";
import { usePlatform } from "@/hooks/usePlatform";
import { useI18n } from "@/i18n/I18nProvider";
import { buildPaletteItems } from "@/lib/palette/items";
import { filterItems } from "@/lib/palette/search";

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { t, locale, setLocale } = useI18n();
  const wm = useWindows();
  const platform = usePlatform();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const { open } = wm;
  const all = useMemo(
    () =>
      buildPaletteItems(
        t,
        locale,
        {
          openApp: open,
          openUrl: (url) => window.open(url, "_blank", "noopener,noreferrer"),
          setLocale,
          resumeUrl: (l) => RESUME_FILES[l],
        },
        platform === "mac" ? "⌥" : "Alt",
      ),
    [t, locale, open, setLocale, platform],
  );
  const items = useMemo(() => filterItems(all, query), [all, query]);
  const active = Math.min(index, Math.max(items.length - 1, 0));

  // Devolve o foco a quem o tinha antes de abrir.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    input.current?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    document.getElementById(`pal-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (i: number) => {
    const item = items[i];
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length === 0) return;
      setIndex((active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault(); // foco preso no campo: as opções são navegadas por setas
    }
  };

  const groupLabel = (g: string) => t(`palette.groups.${g}` as "palette.groups.apps");

  return (
    <div
      className="chrome fixed inset-0 z-[60] flex items-start justify-center bg-black/55 px-3 pt-[12vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("palette.label")}
        className="window-enter w-full max-w-lg overflow-hidden rounded-xl border border-line/70 bg-[rgba(14,16,20,0.98)] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center gap-2 border-b border-line/50 px-3">
          <Search aria-hidden className="size-4 shrink-0 text-ink-muted" />
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-list"
            aria-activedescendant={items.length ? `pal-opt-${active}` : undefined}
            aria-autocomplete="list"
            aria-label={t("palette.label")}
            placeholder={t("palette.placeholder")}
            autoComplete="off"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>

        <ul
          id="pal-list"
          role="listbox"
          aria-label={t("palette.label")}
          className="max-h-72 overflow-y-auto p-1.5"
        >
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-muted">
              {t("palette.empty")}
            </li>
          )}
          {items.map((item, i) => (
            <li
              key={item.id}
              id={`pal-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setIndex(i)}
              onClick={() => run(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                i === active ? "bg-accent/15 text-ink" : "text-ink-secondary"
              }`}
            >
              <span className="min-w-0 truncate">{item.label}</span>
              <span className="flex shrink-0 items-center gap-2">
                {item.shortcut && (
                  <kbd className="rounded border border-line/70 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                    {item.shortcut}
                  </kbd>
                )}
                <span className="font-mono text-[10px] tracking-wider text-ink-muted uppercase">
                  {groupLabel(item.group)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="border-t border-line/50 px-3 py-2 font-mono text-[10px] text-ink-muted">
          {t("palette.hints")}
        </p>
      </div>
    </div>
  );
}
