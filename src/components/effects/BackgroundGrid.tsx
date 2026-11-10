/**
 * Vinheta + grade quase invisível. Puro CSS: não custa nada em runtime.
 * Ordem das camadas: vinheta (fundo) → grade. Sem z-index negativo: ele
 * ficaria atrás do bg do <main> e a vinheta nunca apareceria.
 */
export function BackgroundGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, var(--color-bg-secondary) 0%, var(--color-bg) 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
