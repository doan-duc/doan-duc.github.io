import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect that does not warn during SSR. We use the layout variant on
 * the client so GSAP sets initial animation states BEFORE first paint — this is
 * what prevents the reveal "flash" (content showing, then snapping to hidden).
 */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
