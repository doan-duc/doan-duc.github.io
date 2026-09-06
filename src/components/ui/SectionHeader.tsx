"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { DUR, EASE, START } from "@/lib/motion-tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Editorial section heading, choreographed as one phrase on one trigger:
 * kicker fades up → title clip-wipes open → the signal rule draws through.
 *
 * The bottom rule is an SVG "signal baseline" — a flat line carrying a single
 * ECG beat — this portfolio's signature. SSR ships everything fully visible
 * (rule fully drawn, title unclipped), so no-JS and reduced-motion readers get
 * a complete header; the timeline only rewinds those states when it is
 * actually going to play.
 */
export function SectionHeader({
  index,
  kicker,
  title,
  className,
}: {
  index?: string;
  kicker: string;
  title: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const rule = el.querySelector<SVGPathElement>("[data-header-rule-path]");
      const tl = gsap.timeline({
        defaults: { ease: EASE.enter },
        scrollTrigger: { trigger: el, start: START.reveal, once: true },
      });

      tl.from("[data-header-kicker]", { y: 16, opacity: 0, duration: DUR.fast });
      tl.fromTo(
        "[data-header-title]",
        { clipPath: "inset(0 100% -12% 0)", y: 18 },
        { clipPath: "inset(0 0% -12% 0)", y: 0, duration: DUR.standard },
        "-=0.25",
      );
      if (rule) {
        // pathLength=1 normalises the dash space so 1 → 0 draws left→right.
        tl.fromTo(
          rule,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: DUR.standard, ease: "none" },
          "<+0.1",
        );
      }
      if (index) {
        tl.from("[data-header-index]", { y: 14, opacity: 0, duration: DUR.fast }, "-=0.6");
      }
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-3xl">
        <span data-header-kicker className="kicker block">
          {kicker}
        </span>
        <h2
          data-header-title
          className="mt-5 text-balance text-[clamp(2.35rem,9vw,4rem)] leading-[0.98] tracking-display md:text-6xl"
        >
          {title}
        </h2>
      </div>
      {index && (
        <span data-header-index className="meta-label">
          {index}
        </span>
      )}
      {/* Signal baseline: flat rule with one ECG beat, drawn by the timeline. */}
      <svg
        aria-hidden="true"
        className="section-header-rule"
        viewBox="0 0 1200 20"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* ECG-shaped path kept for later reuse:
        <path data-header-rule-path pathLength={1} vectorEffect="non-scaling-stroke" d="M0 14 H822 l7 -8 9 12 7 -10 8 6 H1200" />
        */}
        <path
          data-header-rule-path
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          d="M0 14 H1200"
        />
      </svg>
    </div>
  );
}
