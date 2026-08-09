"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { observeMediaQuery } from "@/lib/media-query";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type LenisContextValue = {
  scrollTo: (
    target: string | number | HTMLElement,
    opts?: Record<string, unknown>
  ) => void;
};

const LenisContext = createContext<LenisContextValue>({ scrollTo: () => {} });
export const useSmoothScroll = () => useContext(LenisContext);

/** Lenis is kept for desktop wheel polish, while touch/mobile use native scroll. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const compactViewport = window.matchMedia("(max-width: 899px)");
    const saveData =
      "connection" in navigator &&
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    let stopLenis: (() => void) | undefined;

    const configure = () => {
      stopLenis?.();
      stopLenis = undefined;

      if (
        reduceMotion.matches ||
        coarsePointer.matches ||
        compactViewport.matches ||
        saveData
      ) {
        lenisRef.current = null;
        ScrollTrigger.refresh();
        return;
      }

      const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);

      const update = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(update);

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const settle = window.setTimeout(refresh, 400);

      stopLenis = () => {
        gsap.ticker.remove(update);
        window.removeEventListener("load", refresh);
        window.clearTimeout(settle);
        lenis.destroy();
        if (lenisRef.current === lenis) lenisRef.current = null;
      };
    };

    configure();
    const stopObservers = [reduceMotion, coarsePointer, compactViewport].map((query) =>
      observeMediaQuery(query, configure),
    );

    return () => {
      stopObservers.forEach((stopObserving) => stopObserving());
      stopLenis?.();
    };
  }, []);

  const scrollTo: LenisContextValue["scrollTo"] = (target, opts) => {
    const lenis = lenisRef.current;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    if (lenis && behavior === "smooth") {
      lenis.scrollTo(target, { offset: -80, duration: 1.2, ...opts });
    } else if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({ behavior });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior });
    } else {
      target.scrollIntoView({ behavior });
    }
  };

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
