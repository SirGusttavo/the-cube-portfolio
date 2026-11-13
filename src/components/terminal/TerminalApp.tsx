"use client";

import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useWindows } from "@/contexts/WindowManager";
import { useI18n } from "@/i18n/I18nProvider";
import { completeCommand, runCommand } from "@/lib/terminal/commands";

type Entry =
  | { id: number; kind: "welcome" }
  | { id: number; kind: "input" | "output" | "error"; text: string };

const PROMPT = "visitor@the-cube:~$";
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

/** Texto com URLs clicáveis. Só http(s); nada de HTML injetado. */
function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-light underline underline-offset-2"
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function TerminalApp() {
  const { t, locale, setLocale } = useI18n();
  const wm = useWindows();
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, kind: "welcome" }]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef<number | null>(null); // posição no histórico (null = linha nova)
  const nextId = useRef(1);
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  // Efeitos de filhos rodam antes dos do pai: o campo foca primeiro e o WindowFrame,
  // ao ver o foco já dentro dele, não o rouba. Sem requestAnimationFrame: ele podia
  // disparar tarde e devolver o foco ao campo depois de a pessoa tê-lo tirado (Esc).
  useEffect(() => {
    input.current?.focus();
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  const push = (...items: Array<Omit<Extract<Entry, { text: string }>, "id">>) =>
    setEntries((prev) => [
      ...prev,
      ...items.map((it) => ({ ...it, id: nextId.current++ })),
    ]);

  const submit = () => {
    const line = value.trim();
    setValue("");
    cursor.current = null;
    if (!line) return;
    if (history.current[history.current.length - 1] !== line) history.current.push(line);

    const result = runCommand(line, { t, locale, now: new Date() });
    if (result.action?.type === "clear") {
      setEntries([]);
      return;
    }
    push(
      { kind: "input", text: line },
      ...result.lines.map((text) => ({
        kind: result.error ? ("error" as const) : ("output" as const),
        text,
      })),
    );
    if (result.action?.type === "open") wm.open(result.action.app);
    if (result.action?.type === "locale") setLocale(result.action.locale);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (h.length === 0) return;
      let next: number | null;
      if (e.key === "ArrowUp")
        next = cursor.current === null ? h.length - 1 : Math.max(0, cursor.current - 1);
      else
        next =
          cursor.current === null || cursor.current >= h.length - 1
            ? null
            : cursor.current + 1;
      cursor.current = next;
      setValue(next === null ? "" : h[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const options = completeCommand(value);
      if (options.length === 1)
        setValue(options[0] + (options[0].includes(" ") ? "" : " "));
      else if (options.length > 1)
        push(
          { kind: "input", text: value },
          { kind: "output", text: options.join("   ") },
        );
    } else if (e.key.toLowerCase() === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-black/40 font-mono text-[12.5px] leading-relaxed"
      onClick={() => input.current?.focus()}
    >
      <div role="log" aria-live="polite" className="min-h-0 flex-1 overflow-y-auto p-4">
        {entries.map((e) => (
          <div
            key={e.id}
            className={
              e.kind === "error"
                ? "text-red-400"
                : e.kind === "input"
                  ? "text-ink"
                  : "text-ink-secondary"
            }
          >
            {e.kind === "welcome" ? (
              <span className="text-accent">{t("terminal.welcome")}</span>
            ) : e.kind === "input" ? (
              <>
                <span className="text-accent">{PROMPT}</span> {e.text}
              </>
            ) : (
              <span className="break-words whitespace-pre-wrap">
                <Linkified text={e.text} />
              </span>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="shrink-0 border-t border-line/40 p-3">
        <label className="flex items-center gap-2">
          <span aria-hidden className="shrink-0 text-accent">
            {PROMPT}
          </span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label={t("terminal.inputLabel")}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-ink caret-accent outline-none"
          />
        </label>
        <p className="mt-1 text-[10px] text-ink-muted">{t("terminal.hint")}</p>
      </div>
    </div>
  );
}
