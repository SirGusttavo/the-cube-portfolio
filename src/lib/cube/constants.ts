/** Dimensões e parâmetros de animação do cubo (valores iniciais da spec). */
export const DIVISIONS = 4;
export const BLOCK_SIZE = 0.84;
export const GAP = 0.06;
export const PITCH = BLOCK_SIZE + GAP;
/** Aresta total do cubo: 3 passos + 1 bloco = 3,54 u (a spec arredonda para 3,6). */
export const CUBE_EXTENT = (DIVISIONS - 1) * PITCH + BLOCK_SIZE;
export const BLOCK_RADIUS = 0.045;

/**
 * Rotação automática. 0,08 rad/s (valor da spec original) dava uma volta a cada
 * ~78 s e parecia parado; 0,22 rad/s dá uma volta a cada ~29 s: perceptível sem cansar.
 */
export const AUTO_ROTATION_SPEED = 0.22; // rad/s
export const FLOAT_AMPLITUDE = 0.08; // unidades
export const FLOAT_PERIOD = 4; // s

/** Orientação inicial: vértice voltado à câmera, mostrando 3 faces. */
export const INITIAL_YAW = -Math.PI / 4;
export const TILT = 0.5; // rad

/** Posições verticais na cena (cubo e base luminosa). */
export const CUBE_Y = 0.35;
export const BASE_Y = -2.45;

export const LAYOUT_SEED = 0xc0be;

/** Limites de inclinação vertical (rad): evita virar o cubo de ponta-cabeça. */
export const PITCH_MIN = -1.1;
export const PITCH_MAX = 1.3;

/** Radianos por pixel arrastado. ~500 px de arraste ≈ meia volta. */
export const DRAG_SENSITIVITY = 0.0065;
export const WHEEL_SENSITIVITY = 0.0025;
/** Deslocamento máximo (px) para um toque/clique ainda contar como clique, não arraste. */
export const CLICK_THRESHOLD_MOUSE = 5;
export const CLICK_THRESHOLD_TOUCH = 10;
