import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  dictionaries,
  isLocale,
  translate,
  type TKey,
} from "./index";

function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node === "string") return [prefix];
  return Object.entries(node as object).flatMap(([k, v]) =>
    leafPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("i18n", () => {
  it("português é o idioma padrão", () => {
    expect(DEFAULT_LOCALE).toBe("pt-BR");
    expect(translate("pt-BR", "apps.projects")).toBe("Projetos");
    expect(translate("en", "apps.projects")).toBe("Projects");
  });

  it("todos os idiomas têm exatamente as mesmas chaves", () => {
    const base = leafPaths(dictionaries["pt-BR"]).sort();
    for (const locale of LOCALES)
      expect(leafPaths(dictionaries[locale]).sort()).toEqual(base);
  });

  it("nenhuma tradução está vazia", () => {
    for (const locale of LOCALES)
      for (const path of leafPaths(dictionaries[locale]))
        expect(translate(locale, path as TKey).trim().length).toBeGreaterThan(0);
  });

  it("variáveis {x} são substituídas e preservadas se faltarem", () => {
    expect(translate("en", "taskbar.open", { app: "Terminal" })).toBe("Open Terminal");
    expect(translate("pt-BR", "taskbar.open")).toBe("Abrir {app}");
  });

  it("cada idioma usa os mesmos placeholders {x}", () => {
    for (const path of leafPaths(dictionaries["pt-BR"])) {
      const vars = (locale: (typeof LOCALES)[number]) =>
        (translate(locale, path as TKey).match(/\{\w+\}/g) ?? []).sort().join();
      expect(vars("en"), path).toBe(vars("pt-BR"));
    }
  });

  it("chave inexistente devolve a própria chave (não quebra a tela)", () => {
    expect(translate("en", "nao.existe" as TKey)).toBe("nao.existe");
  });

  it("valida idiomas suportados", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it("não mistura idiomas: EN não contém rótulos em português da interface", () => {
    const en = JSON.stringify(dictionaries.en);
    for (const word of ["Baixar", "Currículo", "Projetos", "Tecnologias", "Voltar"])
      expect(en).not.toContain(word);
  });
});
