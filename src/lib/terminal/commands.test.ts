import { describe, expect, it } from "vitest";
import { LOCALES, translate, type Locale } from "@/i18n";
import { COMMAND_NAMES, completeCommand, runCommand } from "./commands";

const ctxFor = (locale: Locale) => ({
  locale,
  now: new Date("2026-11-12T15:30:00Z"),
  t: (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(locale, key, vars),
});
const pt = ctxFor("pt-BR");
const en = ctxFor("en");

describe("runCommand", () => {
  it.each(LOCALES)("todos os comandos definidos respondem em %s", (locale) => {
    const ctx = ctxFor(locale);
    for (const name of COMMAND_NAMES) {
      const input =
        name === "open" ? "open projects" : name === "lang" ? "lang en" : name;
      const r = runCommand(input, ctx);
      expect(r.error, name).toBeFalsy();
      if (name !== "clear") expect(r.lines.join("").length, name).toBeGreaterThan(0);
    }
  });

  it("help lista todos os comandos e documenta os atalhos", () => {
    const text = runCommand("help", pt).lines.join("\n");
    for (const name of COMMAND_NAMES) expect(text).toContain(name);
    expect(text).toContain("Ctrl");
  });

  it("comando inválido gera mensagem de erro no idioma atual", () => {
    expect(runCommand("rm -rf /", pt)).toEqual({
      lines: ["comando não reconhecido: rm. Digite “help”."],
      error: true,
    });
    expect(runCommand("sudo", en).lines[0]).toBe(
      "command not recognized: sudo. Type “help”.",
    );
  });

  it("não executa nada além da tabela: entradas perigosas são só 'não reconhecidas'", () => {
    for (const evil of [
      "$(whoami)",
      "help; ls",
      "`id`",
      "../etc/passwd",
      "eval(1)",
      "<script>",
    ]) {
      const r = runCommand(evil, pt);
      expect(r.action).toBeUndefined();
    }
  });

  it("entrada vazia não faz nada; maiúsculas e espaços extras são tolerados", () => {
    expect(runCommand("   ", pt)).toEqual({ lines: [] });
    expect(runCommand("  HELP  ", pt).lines[0]).toBe("Comandos disponíveis:");
  });

  it("open navega para áreas válidas e rejeita as demais", () => {
    expect(runCommand("open terminal", pt).action).toEqual({
      type: "open",
      app: "terminal",
    });
    expect(runCommand("open PROJECTS", pt).action).toEqual({
      type: "open",
      app: "projects",
    });
    const bad = runCommand("open nada", pt);
    expect(bad.error).toBe(true);
    expect(bad.action).toBeUndefined();
    expect(runCommand("open", pt).error).toBe(true);
  });

  it("lang troca de idioma (com aliases) e confirma no idioma novo", () => {
    const r = runCommand("lang en", pt);
    expect(r.action).toEqual({ type: "locale", locale: "en" });
    expect(r.lines[0]).toBe("language changed to English");
    expect(runCommand("lang pt", en).action).toEqual({ type: "locale", locale: "pt-BR" });
    expect(runCommand("lang klingon", pt).error).toBe(true);
  });

  it("clear devolve a ação de limpar", () => {
    expect(runCommand("clear", pt).action).toEqual({ type: "clear" });
  });

  it("date segue o idioma", () => {
    expect(runCommand("date", pt).lines[0]).toMatch(/novembro/i);
    expect(runCommand("date", en).lines[0]).toMatch(/November/);
  });

  it("projects mostra a classificação honesta (inclui o fork de terceiros)", () => {
    const text = runCommand("projects", pt).lines.join("\n");
    expect(text).toContain("FLOW");
    expect(text).toContain("Fork de terceiros");
    expect(text).toContain("Aprendizagem");
  });

  it("contact usa o e-mail novo e o e-mail antigo não aparece em NENHUMA saída", () => {
    expect(runCommand("contact", pt).lines.join("\n")).toContain(
      "gmorais.net@outlook.com",
    );
    for (const ctx of [pt, en])
      for (const name of COMMAND_NAMES) {
        const input = name === "open" ? "open about" : name === "lang" ? "lang pt" : name;
        expect(runCommand(input, ctx).lines.join("\n")).not.toContain("gustavo28");
      }
  });
});

describe("completeCommand", () => {
  it("completa comandos por prefixo", () => {
    expect(completeCommand("he")).toEqual(["help"]);
    expect(completeCommand("e")).toEqual(["experience", "education"]);
    expect(completeCommand("zzz")).toEqual([]);
  });
  it("completa argumentos de open e lang", () => {
    expect(completeCommand("open te")).toEqual(["open tech", "open terminal"]);
    expect(completeCommand("open ")).toHaveLength(6);
    expect(completeCommand("lang p")).toEqual(["lang pt-BR"]);
  });
  it("não completa argumentos de outros comandos", () => {
    expect(completeCommand("help x")).toEqual([]);
  });
});
