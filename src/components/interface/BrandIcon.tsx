/** Ícone de marca a partir de um path 24x24 (ex.: `simple-icons`). */
export function BrandIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d={path} />
    </svg>
  );
}
