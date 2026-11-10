/**
 * Paleta para uso em JS/WebGL (Three.js não lê variáveis CSS).
 * Espelha os tokens `--color-*` de `app/globals.css`. Se mudar um, mude o outro.
 */
export const palette = {
  bg: "#050505",
  bgSecondary: "#0B0D10",
  surface: "#171A20",
  surfaceRaised: "#22262D",
  border: "#353B45",
  text: "#F5F5F5",
  textSecondary: "#A5AAB3",
  textMuted: "#686F7A",
  accent: "#FF7900",
  accentLight: "#FF9D42",
  glow: "#FFC078",
  success: "#28D17C",
} as const;

export type PaletteKey = keyof typeof palette;
