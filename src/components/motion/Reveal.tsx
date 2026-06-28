"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Animate direct children one-by-one (staggered). */
  stagger?: boolean;
  /** Vertical travel distance in px. */
  y?: number;
  delay?: number;
  /** ScrollTrigger start position. */
  start?: string;
};

/**
 * GSAP + ScrollTrigger reveal-on-scroll. Runs in a layout effect so the
 * "from" state is applied before paint (no flash). Reduced-motion = no-op,
 * content stays visible. This is the workhorse for "every section reveals".
 */
export function Reveal({
  children,
  as,
  className,
  stagger = false,
  y = 32,
  delay = 0,
  start = "top 84%",
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const targets = stagger
        ? (gsap.utils.toArray(el.children) as Element[])
        : el;
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.9,
        ease: "power3.out",
        delay,
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
