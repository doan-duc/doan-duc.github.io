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

/** Single source for scroll tuning. lerp 0.1 keeps the luxurious settle on a
 *  discrete wheel while shortening the tail that read as lag on trackpads. */
const LERP = 0.1;
const WHEEL_MULTIPLIER = 0.85;

type LenisContextValue = {
  scrollTo: (
    target: string | number | HTMLElement,
    opts?: Record<string, unknown>
  ) => void;
};

const LenisContext = createContext<LenisContextValue>({ scrollTo: () => {} });
export const useSmoothScroll = () => useContext(LenisContext);

/**
 * Lenis boots eagerly on wheel-capable, motion-tolerant devices, so the whole
 * session runs ONE scroll system. (The old lazy bootstrap replayed the first
 * wheel event by hand — its deltaMode guess made the first notch travel ~2×
 * further in Chrome than Firefox, and until it fired, UA smooth-scroll and
 * Lenis coexisted.) Touch-first devices never construct it; a touch pointer
 * on a hybrid device tears it down to keep native touch scrolling.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wheelCapable = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    let stopLenis: (() => void) | undefined;

    const destroyLenis = () => {
      stopLenis?.();
      stopLenis = undefined;
      lenisRef.current = null;
    };

    const startLenis = () => {
      if (lenisRef.current) return lenisRef.current;
      if (reduceMotion.matches || !wheelCapable.matches) return null;
      const lenis = new Lenis({
        lerp: LERP,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: WHEEL_MULTIPLIER,
        touchMultiplier: 1,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);
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

      return lenis;
    };

    const bootstrap = () => {
      if (reduceMotion.matches || !wheelCapable.matches) {
        destroyLenis();
        ScrollTrigger.refresh();
        return;
      }
      startLenis();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        // A hybrid device being used by touch: keep scrolling native.
        destroyLenis();
        return;
      }
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        startLenis();
      }
    };

    // Re-arm after a touch teardown the moment the user returns to the wheel.
    // Passive and replay-free: the notch that re-boots Lenis scrolls natively,
    // every subsequent one is interpolated.
    const handleWheel = (event: WheelEvent) => {
      if (lenisRef.current) return;
      if (event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      startLenis();
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: true,
    });
    window.addEventListener("wheel", handleWheel, { passive: true });
    bootstrap();
    const stopObservers = [reduceMotion, wheelCapable].map((query) =>
      observeMediaQuery(query, () => {
        destroyLenis();
        bootstrap();
      }),
    );

    return () => {
      stopObservers.forEach((stopObserving) => stopObserving());
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("wheel", handleWheel);
      destroyLenis();
    };
  }, []);

  const scrollTo: LenisContextValue["scrollTo"] = (target, opts) => {
    const lenis = lenisRef.current;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    const offset = typeof opts?.offset === "number" ? opts.offset : -80;
    const scrollElementIntoView = (element: HTMLElement) => {
      const top = element.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior });
    };
    if (lenis && behavior === "smooth") {
      lenis.scrollTo(target, { offset: -80, duration: 1.2, ...opts });
    } else if (typeof target === "string") {
      const element = document.querySelector<HTMLElement>(target);
      if (element) scrollElementIntoView(element);
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior });
    } else {
      scrollElementIntoView(target);
    }
  };

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
