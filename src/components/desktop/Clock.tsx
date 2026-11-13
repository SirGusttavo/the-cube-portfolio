"use client";

import { useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/I18nProvider";

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 15_000);
  return () => window.clearInterval(id);
}
/** Snapshot = minuto atual (primitivo estável). No servidor: null, sem texto → sem hidratação divergente. */
const getMinute = () => Math.floor(Date.now() / 60_000);

export function Clock() {
  const { locale } = useI18n();
  const minute = useSyncExternalStore(subscribe, getMinute, () => null);
  if (minute === null) return <span className="w-10" aria-hidden />;
  const date = new Date(minute * 60_000);
  return (
    <time
      dateTime={date.toISOString()}
      className="hidden px-2 font-mono text-[11px] text-ink-secondary sm:block"
    >
      {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
        date,
      )}
    </time>
  );
}
