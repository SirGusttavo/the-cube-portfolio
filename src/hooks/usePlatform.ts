import { useSyncExternalStore } from "react";

export type Platform = "windows" | "mac" | "other";

/**
 * Detecta o sistema só para rotular atalhos (Ctrl x ⌘) e escolher a fonte de
 * sistema da interface. Nunca bloqueia nada. `userAgentData` (Chromium) é a
 * fonte preferida; Firefox/Safari não a expõem e caem no User-Agent. Observação:
 * navegadores congelam o UA e o Windows 11 se declara "Windows 10", então não
 * dá para distinguir versões, e este código não tenta.
 */
export function detectPlatform(uaDataPlatform?: string, userAgent?: string): Platform {
  const source = `${uaDataPlatform ?? ""} ${userAgent ?? ""}`;
  if (/windows/i.test(source)) return "windows";
  if (/mac|iphone|ipad|ipod/i.test(source)) return "mac";
  return "other";
}

const subscribe = () => () => {};
const getSnapshot = (): Platform => {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return detectPlatform(nav.userAgentData?.platform, nav.userAgent);
};

/** No servidor devolve "other"; no cliente, o valor real (sem erro de hidratação). */
export function usePlatform(): Platform {
  return useSyncExternalStore(subscribe, getSnapshot, () => "other");
}
