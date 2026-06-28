import { useEffect, useLayoutEffect } from "react";

/** useLayoutEffect that doesn't warn during SSR (prevents reveal flash). */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
