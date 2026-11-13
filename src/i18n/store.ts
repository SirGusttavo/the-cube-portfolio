import { DEFAULT_LOCALE, isLocale, type Locale } from "./index";

export const STORAGE_KEY = "the-cube.locale";

let current: Locale = DEFAULT_LOCALE;
let initialized = false;
const listeners = new Set<() => void>();

function readStored(): Locale {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE; // localStorage bloqueado (modo privado, políticas): segue no padrão
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Store externa (useSyncExternalStore): o servidor sempre renderiza o padrão. */
export const localeStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      current = readStored();
      emit();
    };
    window.addEventListener("storage", onStorage); // sincroniza entre abas
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): Locale {
    if (!initialized) {
      current = readStored();
      initialized = true;
    }
    return current;
  },
  getServerSnapshot: (): Locale => DEFAULT_LOCALE,
  set(locale: Locale) {
    current = locale;
    initialized = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* preferência vale só nesta sessão */
    }
    emit();
  },
};
