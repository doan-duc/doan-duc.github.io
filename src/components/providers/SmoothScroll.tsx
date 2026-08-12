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

/**
 * Lenis registers non-passive touch listeners when constructed, so keep it lazy.
 * Touch-first devices stay native; mouse/wheel intent opts into smooth wheel
 * scrolling without removing any visual animation.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wheelCapable = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    let stopLenis: (() => void) | undefined;
    let stopWheelBootstrap: (() => void) | undefined;

    const destroyLenis = () => {
      stopLenis?.();
      stopLenis = undefined;
      lenisRef.current = null;
    };

    const startLenis = () => {
      if (lenisRef.current) return lenisRef.current;
      if (reduceMotion.matches || !wheelCapable.matches) return null;
      const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.85,
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

    const stopBootstrap = () => {
      stopWheelBootstrap?.();
      stopWheelBootstrap = undefined;
    };

    const bootstrap = () => {
      stopBootstrap();

      if (reduceMotion.matches || !wheelCapable.matches) {
        destroyLenis();
        ScrollTrigger.refresh();
        return;
      }

      const startFromWheel = (event: WheelEvent) => {
        if (
          event.defaultPrevented ||
          !event.cancelable ||
          event.ctrlKey ||
          event.metaKey ||
          event.deltaY === 0 ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ) {
          return;
        }
        const lenis = startLenis();
        stopBootstrap();
        if (!lenis) return;

        event.preventDefault();
        const unit =
          event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? window.innerHeight
              : 1;
        const destination = Math.max(
          0,
          Math.min(
            document.documentElement.scrollHeight - window.innerHeight,
            window.scrollY + event.deltaY * unit * 0.85,
          ),
        );
        lenis.scrollTo(destination, { duration: 1.15 });
      };

      window.addEventListener("wheel", startFromWheel, {
        capture: true,
        passive: false,
      });
      stopWheelBootstrap = () => {
        window.removeEventListener("wheel", startFromWheel, { capture: true });
      };
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        destroyLenis();
        bootstrap();
        return;
      }
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        startLenis();
        stopBootstrap();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: true,
    });
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
      stopBootstrap();
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
