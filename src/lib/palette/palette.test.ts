import { describe, expect, it, vi } from "vitest";
import { translate, type Locale } from "@/i18n";
import { detectPlatform } from "@/hooks/usePlatform";
import { DIGIT_APPS } from "@/hooks/useGlobalShortcuts";
import { buildPaletteItems } from "./items";
import { filterItems, normalize } from "./search";

const build = (locale: Locale) => {
  const actions = {
    openApp: vi.fn(),
    openUrl: vi.fn(),
    setLocale: vi.fn(),
    resumeUrl: (l: Locale) => `/resume-${l}.pdf`,
  };
  const items = buildPaletteItems(
    (k, v) => translate(locale, k, v),
    locale,
    actions,
    "Alt",
  );
  return { items, actions };
};

describe("filterItems", () => {
  const items = [
    { label: "Abrir Projetos", keywords: "projects" },
    { label: "Abrir Experiência" },
    { label: "Baixar currículo (PDF)", keywords: "cv resume" },
    { label: "Idioma: English", keywords: "language" },
  ];

  it("consulta vazia devolve tudo na ordem original", () => {
    expect(filterItems(items, "  ")).toEqual(items);
  });
  it("ignora acentos e maiúsculas", () => {
    expect(filterItems(items, "EXPERIENCIA").map((i) => i.label)).toEqual([
      "Abrir Experiência",
    ]);
    expect(normalize("Currículo")).toBe("curriculo");
  });
  it("todos os termos precisam casar", () => {
    expect(filterItems(items, "abrir proj")).toHaveLength(1);
    expect(filterItems(items, "abrir zzz")).toHaveLength(0);
  });
  it("busca por palavras-chave e prioriza início de palavra sobre trecho", () => {
    expect(filterItems(items, "resume")[0].label).toBe("Baixar currículo (PDF)");
    const ranked = filterItems(
      [
        { label: "Contato" },
        { label: "Abrir Contato" },
        { label: "Terminal de contatos" },
      ],
      "contato",
    );
    expect(ranked[0].label).toBe("Contato");
  });
});

describe("itens da central de comandos", () => {
  it.each(["pt-BR", "en"] as const)("cobrem tudo que a spec pede em %s", (locale) => {
    const { items } = build(locale);
    const ids = items.map((i) => i.id);
    for (const required of [
      "app-projects",
      "app-tech",
      "app-experience",
      "app-about",
      "app-terminal",
      "app-contact",
      "resume",
      "lang-pt-BR",
      "lang-en",
    ])
      expect(ids).toContain(required);
  });

  it("executa as ações certas", () => {
    const { items, actions } = build("en");
    items.find((i) => i.id === "app-terminal")!.run();
    expect(actions.openApp).toHaveBeenCalledWith("terminal");
    items.find((i) => i.id === "resume")!.run();
    expect(actions.openUrl).toHaveBeenCalledWith("/resume-en.pdf");
    items.find((i) => i.id === "lang-pt-BR")!.run();
    expect(actions.setLocale).toHaveBeenCalledWith("pt-BR");
  });

  it("a busca funciona nos dois idiomas", () => {
    expect(filterItems(build("pt-BR").items, "curriculo")[0].id).toBe("resume");
    expect(filterItems(build("en").items, "resume")[0].id).toBe("resume");
    expect(filterItems(build("en").items, "terminal")[0].id).toBe("app-terminal");
  });

  it("mostra o atalho Alt+N das áreas que têm um", () => {
    const { items } = build("en");
    expect(items.find((i) => i.id === "app-projects")!.shortcut).toBe("Alt+1");
    expect(items.find((i) => i.id === "app-terminal")!.shortcut).toBe("Alt+4");
    expect(items.find((i) => i.id === "app-about")!.shortcut).toBeUndefined();
  });
});

describe("atalhos e plataforma", () => {
  it("Ctrl+1–4 abrem projetos, tecnologias, experiência e terminal", () => {
    expect(DIGIT_APPS).toEqual({
      Digit1: "projects",
      Digit2: "tech",
      Digit3: "experience",
      Digit4: "terminal",
    });
  });
  it("detecta Windows, macOS e outros sem bloquear nada", () => {
    expect(detectPlatform("Windows", "")).toBe("windows");
    expect(detectPlatform(undefined, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(
      "windows",
    );
    expect(detectPlatform("macOS", "")).toBe("mac");
    expect(detectPlatform(undefined, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe(
      "mac",
    );
    expect(detectPlatform("Linux", "X11; Linux x86_64")).toBe("other");
    expect(detectPlatform()).toBe("other");
  });
});
