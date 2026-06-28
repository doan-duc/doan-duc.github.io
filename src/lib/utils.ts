import { clsx, type ClassValue } from "clsx";

/** Tiny className combiner used across components. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** True when the visitor prefers reduced motion (guards heavy animation). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
