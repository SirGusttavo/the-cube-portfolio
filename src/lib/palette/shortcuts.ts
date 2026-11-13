import type { AppId } from "@/types/content";

/** Ctrl/⌘/Alt + dígito. Mantido aqui para o hook de atalhos e a central de comandos usarem a mesma fonte. */
export const DIGIT_APPS_BY_APP: Partial<Record<AppId, number>> = {
  projects: 1,
  tech: 2,
  experience: 3,
  terminal: 4,
};
