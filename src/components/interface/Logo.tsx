/** Símbolo geométrico: cubo isométrico em linha fina. Mesmo desenho de app/icon.svg. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M12 2.5 20.2 7.25v9.5L12 21.5l-8.2-4.75v-9.5Z" />
      <path d="M12 12 3.8 7.25M12 12l8.2-4.75M12 12v9.5" />
    </svg>
  );
}
