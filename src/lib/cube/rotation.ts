import { AUTO_ROTATION_SPEED, PITCH_MAX, PITCH_MIN } from "./constants";

/**
 * Física de rotação do cubo, sem React nem Three.js (testável em Node).
 * Mutável de propósito: roda a cada frame, dentro do useFrame.
 */
export interface RotationState {
  yaw: number;
  pitch: number;
  yawVelocity: number; // rad/s, só da interação (arraste/inércia/teclado)
  pitchVelocity: number;
  /** 0..1: quanto da rotação automática está ativa (sobe suavemente depois da interação). */
  autoWeight: number;
  /** Segundos desde a última interação. */
  idleTime: number;
  dragging: boolean;
  dragDistance: number; // px desde o pointerdown
  wasDrag: boolean; // o último gesto passou do limite de clique?
}

export interface RotationConfig {
  autoSpeed: number; // rad/s; 0 desliga
  damping: number; // 1/s: decaimento exponencial da inércia
  resumeDelay: number; // s parado antes de a rotação automática voltar
  resumeTime: number; // s: constante de tempo do retorno suave
  pitchMin: number;
  pitchMax: number;
  maxVelocity: number; // rad/s
  keyAccel: number; // rad/s² com seta pressionada
  keyMaxVelocity: number;
}

export interface KeyInput {
  yaw: number; // -1, 0, 1
  pitch: number;
}

export function rotationConfig(reducedMotion: boolean): RotationConfig {
  return {
    autoSpeed: reducedMotion ? 0 : AUTO_ROTATION_SPEED,
    // Movimento reduzido: o cubo ainda gira por arraste, mas não "desliza".
    damping: reducedMotion ? 10 : 2.2,
    resumeDelay: 1.2,
    resumeTime: 0.7,
    pitchMin: PITCH_MIN,
    pitchMax: PITCH_MAX,
    maxVelocity: 7,
    keyAccel: 7,
    keyMaxVelocity: 1.8,
  };
}

export function createRotationState(yaw: number, pitch: number): RotationState {
  return {
    yaw,
    pitch,
    yawVelocity: 0,
    pitchVelocity: 0,
    autoWeight: 1,
    idleTime: 0,
    dragging: false,
    dragDistance: 0,
    wasDrag: false,
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function wrapAngle(a: number): number {
  const twoPi = Math.PI * 2;
  return a - twoPi * Math.round(a / twoPi);
}

/** "Agarrar" o cubo: para a inércia e pausa a rotação automática na hora. */
export function beginDrag(s: RotationState): void {
  s.dragging = true;
  s.yawVelocity = 0;
  s.pitchVelocity = 0;
  s.autoWeight = 0;
  s.idleTime = 0;
  s.dragDistance = 0;
  s.wasDrag = false;
}

/** Aplica um deslocamento de arraste (já em radianos) e estima a velocidade de soltura. */
export function dragBy(
  s: RotationState,
  dYaw: number,
  dPitch: number,
  dt: number,
  cfg: RotationConfig,
): void {
  const pitchBefore = s.pitch;
  s.yaw = wrapAngle(s.yaw + dYaw);
  s.pitch = clamp(s.pitch + dPitch, cfg.pitchMin, cfg.pitchMax);
  const appliedPitch = s.pitch - pitchBefore;
  if (dt <= 0) return;
  // Média móvel exponencial (~50 ms): ignora tremida, preserva o "arremesso".
  const alpha = 1 - Math.exp(-dt / 0.05);
  s.yawVelocity += (dYaw / dt - s.yawVelocity) * alpha;
  s.pitchVelocity += (appliedPitch / dt - s.pitchVelocity) * alpha;
  s.yawVelocity = clamp(s.yawVelocity, -cfg.maxVelocity, cfg.maxVelocity);
  s.pitchVelocity = clamp(s.pitchVelocity, -cfg.maxVelocity, cfg.maxVelocity);
}

/**
 * Soltar o ponteiro. Se ele ficou parado antes de soltar, não há "arremesso":
 * sem isso, segurar e soltar faria o cubo sair girando com a velocidade antiga.
 */
export function endDrag(
  s: RotationState,
  secondsSinceLastMove: number,
  clickThresholdPx: number,
): void {
  s.dragging = false;
  s.idleTime = 0;
  s.wasDrag = s.dragDistance > clickThresholdPx;
  if (secondsSinceLastMove > 0.1) {
    s.yawVelocity = 0;
    s.pitchVelocity = 0;
  }
}

/** Deslocamento direto (roda do mouse / trackpad). Sem inércia própria. */
export function nudge(
  s: RotationState,
  dYaw: number,
  dPitch: number,
  cfg: RotationConfig,
): void {
  if (s.dragging) return;
  s.yaw = wrapAngle(s.yaw + dYaw);
  s.pitch = clamp(s.pitch + dPitch, cfg.pitchMin, cfg.pitchMax);
  s.yawVelocity = 0;
  s.pitchVelocity = 0;
  s.autoWeight = 0;
  s.idleTime = 0;
}

/** Avança a simulação em `dt` segundos (independente da taxa de quadros). */
export function stepRotation(
  s: RotationState,
  dt: number,
  cfg: RotationConfig,
  keys?: KeyInput,
): void {
  if (s.dragging) {
    s.autoWeight = 0;
    s.idleTime = 0;
    return; // a posição já foi aplicada por dragBy
  }

  const kx = keys?.yaw ?? 0;
  const ky = keys?.pitch ?? 0;
  if (kx !== 0 || ky !== 0) {
    s.idleTime = 0;
    s.autoWeight *= Math.exp(-dt / 0.12); // pausa a automática sem tranco
    s.yawVelocity = clamp(
      s.yawVelocity + kx * cfg.keyAccel * dt,
      -cfg.keyMaxVelocity,
      cfg.keyMaxVelocity,
    );
    s.pitchVelocity = clamp(
      s.pitchVelocity + ky * cfg.keyAccel * dt,
      -cfg.keyMaxVelocity,
      cfg.keyMaxVelocity,
    );
  } else {
    s.idleTime += dt;
  }

  // Inércia: decaimento exponencial, correto em qualquer taxa de quadros.
  const decay = Math.exp(-cfg.damping * dt);
  s.yawVelocity *= decay;
  s.pitchVelocity *= decay;
  if (Math.abs(s.yawVelocity) < 0.002) s.yawVelocity = 0;
  if (Math.abs(s.pitchVelocity) < 0.002) s.pitchVelocity = 0;

  // Retorno suave da rotação automática depois de um tempo parado.
  if (cfg.autoSpeed > 0 && s.idleTime > cfg.resumeDelay) {
    s.autoWeight += (1 - s.autoWeight) * (1 - Math.exp(-dt / cfg.resumeTime));
  }

  s.yaw = wrapAngle(s.yaw + (s.yawVelocity + cfg.autoSpeed * s.autoWeight) * dt);

  const nextPitch = s.pitch + s.pitchVelocity * dt;
  if (nextPitch > cfg.pitchMax) {
    s.pitch = cfg.pitchMax;
    s.pitchVelocity = 0;
  } else if (nextPitch < cfg.pitchMin) {
    s.pitch = cfg.pitchMin;
    s.pitchVelocity = 0;
  } else {
    s.pitch = nextPitch;
  }
}
