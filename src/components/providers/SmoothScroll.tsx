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

// Register once on the client.
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

/** Hook used by the Nav to drive smooth anchor scrolling. */
export const useSmoothScroll = () => useContext(LenisContext);

/**
 * Wraps the app in Lenis smooth scrolling and wires it into GSAP's ticker so
 * ScrollTrigger stays perfectly in sync (no double-RAF jank). Reduced-motion
 * visitors get native scrolling instead.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.1, // lower = smoother/slower catch-up
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    // Keep ScrollTrigger updated on every Lenis frame.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker (single source of truth for RAF).
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Re-measure pinned/scrub triggers once fonts + images settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const settle = window.setTimeout(refresh, 400);

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("load", refresh);
      window.clearTimeout(settle);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo: LenisContextValue["scrollTo"] = (target, opts) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: -80, duration: 1.2, ...opts });
    } else if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
