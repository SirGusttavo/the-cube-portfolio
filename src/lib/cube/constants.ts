/** Dimensões e parâmetros de animação do cubo (valores iniciais da spec). */
export const DIVISIONS = 4;
export const BLOCK_SIZE = 0.84;
export const GAP = 0.06;
export const PITCH = BLOCK_SIZE + GAP;
/** Aresta total do cubo: 3 passos + 1 bloco = 3,54 u (a spec arredonda para 3,6). */
export const CUBE_EXTENT = (DIVISIONS - 1) * PITCH + BLOCK_SIZE;
export const BLOCK_RADIUS = 0.045;

export const AUTO_ROTATION_SPEED = 0.08; // rad/s
export const FLOAT_AMPLITUDE = 0.08; // unidades
export const FLOAT_PERIOD = 4; // s

/** Orientação inicial: vértice voltado à câmera, mostrando 3 faces. */
export const INITIAL_YAW = -Math.PI / 4;
export const TILT = 0.5; // rad

/** Posições verticais na cena (cubo e base luminosa). */
export const CUBE_Y = 0.35;
export const BASE_Y = -2.45;

export const LAYOUT_SEED = 0xc0be;
