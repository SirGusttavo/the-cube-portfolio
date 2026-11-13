import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";

/** Para adicionar um idioma: crie `locales/xx.json` com as mesmas chaves e registre aqui. */
export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt-BR";

export type Dictionary = typeof ptBR;

/** Caminhos com ponto até as folhas de texto: "faces.projects.label". */
type Paths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
export type TKey = Paths<Dictionary>;

/** `satisfies` faz o TypeScript falhar se um idioma perder ou ganhar chaves. */
export const dictionaries = {
  "pt-BR": ptBR,
  en,
} as const satisfies Record<Locale, Dictionary>;

export type TVars = Record<string, string | number>;
export type Translate = (key: TKey, vars?: TVars) => string;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

function lookup(dict: unknown, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Busca no idioma pedido, cai para o padrão e, por último, devolve a própria chave. */
export function translate(locale: Locale, key: TKey, vars?: TVars): string {
  const text =
    lookup(dictionaries[locale], key) ?? lookup(dictionaries[DEFAULT_LOCALE], key) ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
