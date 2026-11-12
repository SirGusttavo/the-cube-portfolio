import { describe, expect, it } from "vitest";
import {
  beginDrag,
  createRotationState,
  dragBy,
  endDrag,
  nudge,
  rotationConfig,
  stepRotation,
  wrapAngle,
} from "./rotation";
import { AUTO_ROTATION_SPEED, PITCH_MAX, PITCH_MIN } from "./constants";

const cfg = rotationConfig(false);
const reduced = rotationConfig(true);

/** Simula `seconds` de relógio com um dado passo. */
function run(
  s: ReturnType<typeof createRotationState>,
  seconds: number,
  step: number,
  c = cfg,
) {
  for (let t = 0; t < seconds - 1e-9; t += step) stepRotation(s, step, c);
}

describe("rotação automática", () => {
  it("gira na velocidade configurada (perceptível: volta completa em < 40 s)", () => {
    expect((Math.PI * 2) / AUTO_ROTATION_SPEED).toBeLessThan(40);
    const s = createRotationState(0, 0.5);
    run(s, 2, 1 / 60); // idleTime ainda < resumeDelay? autoWeight já é 1 no início
    expect(s.yaw).toBeCloseTo(AUTO_ROTATION_SPEED * 2, 3);
  });

  it("é independente da taxa de quadros", () => {
    const a = createRotationState(0, 0.5);
    const b = createRotationState(0, 0.5);
    run(a, 5, 1 / 30);
    run(b, 5, 1 / 144);
    expect(Math.abs(a.yaw - b.yaw)).toBeLessThan(0.01);
  });

  it("fica desligada com movimento reduzido", () => {
    const s = createRotationState(0.3, 0.5);
    run(s, 10, 1 / 60, reduced);
    expect(s.yaw).toBeCloseTo(0.3, 10);
  });
});

describe("arraste", () => {
  it("é proporcional ao deslocamento e respeita os limites verticais", () => {
    const s = createRotationState(0, 0.5);
    beginDrag(s);
    dragBy(s, 0.1, 0, 0.016, cfg);
    dragBy(s, 0.1, 0, 0.016, cfg);
    expect(s.yaw).toBeCloseTo(0.2, 10);
    dragBy(s, 0, 50, 0.016, cfg);
    expect(s.pitch).toBe(PITCH_MAX);
    dragBy(s, 0, -500, 0.016, cfg);
    expect(s.pitch).toBe(PITCH_MIN);
  });

  it("pausa a rotação automática enquanto arrasta", () => {
    const s = createRotationState(0, 0.5);
    beginDrag(s);
    const yaw = s.yaw;
    run(s, 3, 1 / 60);
    expect(s.yaw).toBe(yaw);
    expect(s.autoWeight).toBe(0);
  });

  it("classifica clique x arraste pelo limite de pixels", () => {
    const click = createRotationState(0, 0.5);
    beginDrag(click);
    click.dragDistance = 3;
    endDrag(click, 0.01, 5);
    expect(click.wasDrag).toBe(false);

    const drag = createRotationState(0, 0.5);
    beginDrag(drag);
    drag.dragDistance = 40;
    endDrag(drag, 0.01, 5);
    expect(drag.wasDrag).toBe(true);
  });
});

describe("inércia", () => {
  function flung() {
    const s = createRotationState(0, 0.5);
    beginDrag(s);
    for (let i = 0; i < 6; i++) dragBy(s, 0.05, 0, 0.016, cfg); // ~3 rad/s
    endDrag(s, 0.005, 5);
    return s;
  }

  it("continua girando depois de soltar e desacelera gradualmente", () => {
    const s = flung();
    const v0 = s.yawVelocity;
    expect(v0).toBeGreaterThan(1);
    const yaw0 = s.yaw;
    run(s, 0.3, 1 / 60);
    expect(s.yaw).not.toBeCloseTo(yaw0, 2);
    expect(s.yawVelocity).toBeLessThan(v0);
    expect(s.yawVelocity).toBeGreaterThan(0);
    run(s, 4, 1 / 60);
    expect(s.yawVelocity).toBe(0);
  });

  it("não há arremesso se o ponteiro ficou parado antes de soltar", () => {
    const s = createRotationState(0, 0.5);
    beginDrag(s);
    for (let i = 0; i < 6; i++) dragBy(s, 0.05, 0, 0.016, cfg);
    endDrag(s, 0.4, 5);
    expect(s.yawVelocity).toBe(0);
  });

  it("com movimento reduzido a inércia some quase na hora", () => {
    const s = createRotationState(0, 0.5);
    beginDrag(s);
    for (let i = 0; i < 6; i++) dragBy(s, 0.05, 0, 0.016, reduced);
    endDrag(s, 0.005, 5);
    run(s, 1, 1 / 60, reduced);
    expect(s.yawVelocity).toBe(0);
  });
});

describe("retomada da rotação automática", () => {
  it("volta de forma gradual e sem saltos de orientação", () => {
    const s = createRotationState(0, 0.5);
    beginDrag(s);
    endDrag(s, 0.5, 5);
    let prevYaw = s.yaw;
    let maxStep = 0;
    let prevWeight = s.autoWeight;
    for (let t = 0; t < 8; t += 1 / 60) {
      stepRotation(s, 1 / 60, cfg);
      maxStep = Math.max(maxStep, Math.abs(wrapAngle(s.yaw - prevYaw)));
      expect(s.autoWeight).toBeGreaterThanOrEqual(prevWeight - 1e-12); // monotônico
      prevWeight = s.autoWeight;
      prevYaw = s.yaw;
    }
    expect(s.autoWeight).toBeGreaterThan(0.99);
    expect(maxStep).toBeLessThanOrEqual((AUTO_ROTATION_SPEED / 60) * 1.0001);
  });

  it("mantém a orientação atual: nada reposiciona o cubo ao retomar", () => {
    const s = createRotationState(0, 0.5);
    beginDrag(s);
    dragBy(s, 1, -0.6, 0.016, cfg);
    s.yawVelocity = 0;
    s.pitchVelocity = 0;
    endDrag(s, 1, 5);
    const pitch = s.pitch;
    run(s, 6, 1 / 60);
    expect(s.pitch).toBe(pitch);
  });
});

describe("teclado e roda", () => {
  it("setas aceleram até um limite e a automática pausa sem tranco", () => {
    const s = createRotationState(0, 0.5);
    for (let t = 0; t < 2; t += 1 / 60)
      stepRotation(s, 1 / 60, cfg, { yaw: 1, pitch: 0 });
    expect(s.yawVelocity).toBeGreaterThan(0.5);
    expect(s.yawVelocity).toBeLessThanOrEqual(cfg.keyMaxVelocity);
    expect(s.autoWeight).toBeLessThan(0.01);
  });

  it("funciona com movimento reduzido (alternativa por teclado)", () => {
    const s = createRotationState(0, 0.5);
    for (let t = 0; t < 1; t += 1 / 60)
      stepRotation(s, 1 / 60, reduced, { yaw: 1, pitch: 0 });
    expect(s.yaw).toBeGreaterThan(0.05);
  });

  it("roda do mouse desloca direto e respeita limites", () => {
    const s = createRotationState(0, 0.5);
    nudge(s, 0.2, 99, cfg);
    expect(s.yaw).toBeCloseTo(0.2, 10);
    expect(s.pitch).toBe(PITCH_MAX);
  });
});

describe("wrapAngle", () => {
  it("mantém o ângulo em [-π, π]", () => {
    for (const a of [0, 3.5, -3.5, 10, -10, 100]) {
      const w = wrapAngle(a);
      expect(Math.abs(w)).toBeLessThanOrEqual(Math.PI + 1e-12);
      expect(Math.cos(w)).toBeCloseTo(Math.cos(a), 10);
    }
  });
});
