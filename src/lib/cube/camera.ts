/**
 * Distância da câmera para enquadrar o cubo.
 *
 * Alvo: o cubo (silhueta ~5,4 u) ocupa ~55% da altura no desktop e nunca mais
 * que ~75% da largura em telas estreitas (smartphone em retrato).
 */
const STAGE_HEIGHT = 9.8;
const STAGE_WIDTH = 7.2;

export function cameraDistance(aspect: number, fovDeg: number): number {
  const halfTan = Math.tan((fovDeg * Math.PI) / 360);
  const fitHeight = STAGE_HEIGHT / (2 * halfTan);
  const fitWidth = STAGE_WIDTH / (aspect * 2 * halfTan);
  return Math.max(fitHeight, fitWidth);
}
