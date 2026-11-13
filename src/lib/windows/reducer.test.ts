import { describe, expect, it } from "vitest";
import {
  defaultPosition,
  initialWindowsState,
  windowsReducer,
  type WindowsAction,
  type WindowsState,
} from "./reducer";

const desktop = { width: 1440, height: 900 };
const phone = { width: 390, height: 844 };

const run = (actions: WindowsAction[], from: WindowsState = initialWindowsState) =>
  actions.reduce(windowsReducer, from);

describe("windowsReducer", () => {
  it("abre e foca uma janela nova", () => {
    const s = run([{ type: "open", id: "projects", viewport: desktop }]);
    expect(s.focused).toBe("projects");
    expect(s.order).toEqual(["projects"]);
    expect(s.windows.projects).toMatchObject({ minimized: false, closing: false });
  });

  it("janelas novas empilham em cascata e a última fica no topo e com foco", () => {
    const s = run([
      { type: "open", id: "projects", viewport: desktop },
      { type: "open", id: "terminal", viewport: desktop },
    ]);
    expect(s.order).toEqual(["projects", "terminal"]);
    expect(s.focused).toBe("terminal");
    expect(s.windows.terminal!.x).toBeLessThan(s.windows.projects!.x);
    expect(s.windows.terminal!.y).toBeGreaterThan(s.windows.projects!.y);
  });

  it("abrir de novo uma janela existente só a traz para a frente (sem duplicar)", () => {
    const s = run([
      { type: "open", id: "projects", viewport: desktop },
      { type: "open", id: "terminal", viewport: desktop },
      { type: "open", id: "projects", viewport: desktop },
    ]);
    expect(s.order).toEqual(["terminal", "projects"]);
    expect(s.focused).toBe("projects");
  });

  it("foco muda o z-order", () => {
    const s = run([
      { type: "open", id: "projects", viewport: desktop },
      { type: "open", id: "tech", viewport: desktop },
      { type: "focus", id: "projects" },
    ]);
    expect(s.order).toEqual(["tech", "projects"]);
    expect(s.focused).toBe("projects");
  });

  it("minimizar passa o foco para a janela visível mais alta, ou para nenhuma", () => {
    let s = run([
      { type: "open", id: "projects", viewport: desktop },
      { type: "open", id: "tech", viewport: desktop },
      { type: "minimize", id: "tech" },
    ]);
    expect(s.windows.tech!.minimized).toBe(true);
    expect(s.focused).toBe("projects");
    s = windowsReducer(s, { type: "minimize", id: "projects" });
    expect(s.focused).toBeNull();
  });

  it("restaurar traz de volta com foco e no topo", () => {
    const s = run([
      { type: "open", id: "projects", viewport: desktop },
      { type: "open", id: "tech", viewport: desktop },
      { type: "minimize", id: "projects" },
      { type: "restore", id: "projects" },
    ]);
    expect(s.windows.projects!.minimized).toBe(false);
    expect(s.focused).toBe("projects");
    expect(s.order[s.order.length - 1]).toBe("projects");
  });

  it("não dá foco a janela minimizada", () => {
    const s = run([
      { type: "open", id: "projects", viewport: desktop },
      { type: "minimize", id: "projects" },
      { type: "focus", id: "projects" },
    ]);
    expect(s.focused).toBeNull();
  });

  it("fechar em duas etapas: animação de saída e depois remoção", () => {
    let s = run([
      { type: "open", id: "projects", viewport: desktop },
      { type: "open", id: "tech", viewport: desktop },
      { type: "requestClose", id: "tech" },
    ]);
    expect(s.windows.tech!.closing).toBe(true);
    expect(s.focused).toBe("projects");
    s = windowsReducer(s, { type: "close", id: "tech" });
    expect(s.windows.tech).toBeUndefined();
    expect(s.order).toEqual(["projects"]);
  });

  it("botão da barra de tarefas: abre, foca, minimiza e restaura (como no Windows)", () => {
    let s = run([{ type: "toggle", id: "terminal", viewport: desktop }]);
    expect(s.focused).toBe("terminal");
    s = windowsReducer(s, { type: "toggle", id: "terminal", viewport: desktop }); // focada → minimiza
    expect(s.windows.terminal!.minimized).toBe(true);
    s = windowsReducer(s, { type: "toggle", id: "terminal", viewport: desktop }); // minimizada → restaura
    expect(s.windows.terminal!.minimized).toBe(false);
    expect(s.focused).toBe("terminal");
    s = run(
      [
        { type: "open", id: "tech", viewport: desktop },
        { type: "toggle", id: "terminal", viewport: desktop }, // aberta mas sem foco → foca
      ],
      s,
    );
    expect(s.focused).toBe("terminal");
  });

  it("mover só altera a posição", () => {
    const s = run([
      { type: "open", id: "about", viewport: desktop },
      { type: "move", id: "about", x: 10, y: 20 },
    ]);
    expect(s.windows.about).toMatchObject({ x: 10, y: 20, minimized: false });
  });

  it("ações em janela inexistente não quebram nada", () => {
    for (const type of [
      "focus",
      "minimize",
      "restore",
      "requestClose",
      "close",
    ] as const) {
      expect(windowsReducer(initialWindowsState, { type, id: "about" })).toBe(
        initialWindowsState,
      );
    }
  });

  it("posição padrão: cascata no desktop, origem no celular (tela cheia)", () => {
    expect(defaultPosition(desktop, 0).x).toBeGreaterThan(defaultPosition(desktop, 2).x);
    expect(defaultPosition(phone, 3)).toEqual({ x: 0, y: 0 });
    expect(defaultPosition({ width: 800, height: 600 }, 0).x).toBeGreaterThanOrEqual(16);
  });
});
