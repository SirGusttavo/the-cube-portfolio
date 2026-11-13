import { useMediaQuery } from "./useMediaQuery";

/** `true` quando o usuário pediu menos movimento. No servidor assume `false`. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
