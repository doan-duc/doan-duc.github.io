"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

type TiltSpring = {
  stiffness: number;
  damping: number;
  mass: number;
};

const defaultSpring: TiltSpring = {
  stiffness: 150,
  damping: 18,
  mass: 0.4,
};

/** 3D tilt toward the pointer (Framer micro-interaction). Keep `max` low. */
export function TiltCard({
  children,
  className,
  max = 6,
  hoverScale = 1,
  spring = defaultSpring,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  hoverScale?: number;
  spring?: TiltSpring;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const scaleTarget = useMotionValue(1);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const scale = useSpring(scaleTarget, spring);

  function handleMove(e: React.MouseEvent) {
    if (
      shouldReduceMotion ||
      window.matchMedia("(hover: none), (pointer: coarse)").matches
    ) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  function activate() {
    if (
      shouldReduceMotion ||
      window.matchMedia("(hover: none), (pointer: coarse)").matches
    ) return;
    scaleTarget.set(hoverScale);
  }

  function reset() {
    px.set(0);
    py.set(0);
    scaleTarget.set(1);
  }

  return (
    <motion.div
      ref={ref}
      onMouseEnter={activate}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative", className)}
    >
      {children}
    </motion.div>
  );
}
