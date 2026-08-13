"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { DEPTH, DUR, EASE, START } from "@/lib/motion-tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type DepthRevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Depth tier the block settles forward from. */
  depth?: keyof typeof DEPTH;
  /** Stagger direct children instead of moving the block as one object. */
  stagger?: boolean;
};

/**
 * Reveal-from-depth: the block settles forward out of z-space with a slight
 * hinge — the same physical event as every 3D section entrance, packaged for
 * places without their own GSAP context (e.g. the Contact finale).
 */
export function DepthReveal({
  children,
  as,
  className,
  depth = "shallow",
  stagger = false,
}: DepthRevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const targets = stagger ? (gsap.utils.toArray(el.children) as Element[]) : el;
      gsap.from(targets, {
        z: DEPTH[depth],
        rotateX: 4,
        y: 32,
        opacity: 0,
        transformPerspective: 900,
        duration: DUR.slow,
        ease: EASE.enter,
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: el, start: START.reveal, once: true },
        onComplete: () => {
          gsap.set(targets, { clearProps: "transform" });
        },
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
