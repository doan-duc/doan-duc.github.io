"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { usePointerEffectsEnabled } from "@/components/motion/use-pointer-effects-enabled";

type TiltSpring = {
  stiffness: number;
  damping: number;
  mass: number;
};

const defaultSpring: TiltSpring = {
  stiffness: 220,
  damping: 20,
  mass: 0.3,
};

/** 3D tilt toward the pointer (Framer micro-interaction). Keep `max` low. */
export function TiltCard({
  children,
  className,
  max = 8,
  hoverScale = 1.012,
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
  const pointerEffectsEnabled = usePointerEffectsEnabled();
  const boundsRef = useRef<DOMRect | null>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const scaleTarget = useMotionValue(1);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const scale = useSpring(scaleTarget, spring);

  function handleMove(e: React.MouseEvent) {
    if (shouldReduceMotion || !pointerEffectsEnabled) return;
    const el = ref.current;
    if (!el) return;
    const r = boundsRef.current ?? el.getBoundingClientRect();
    boundsRef.current = r;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  function activate() {
    if (shouldReduceMotion || !pointerEffectsEnabled) return;
    boundsRef.current = ref.current?.getBoundingClientRect() ?? null;
    scaleTarget.set(hoverScale);
  }

  function reset() {
    boundsRef.current = null;
    px.set(0);
    py.set(0);
    scaleTarget.set(1);
  }

  useEffect(() => {
    if (!shouldReduceMotion && pointerEffectsEnabled) return;
    boundsRef.current = null;
    px.set(0);
    py.set(0);
    scaleTarget.set(1);
    rotateX.jump(0);
    rotateY.jump(0);
    scale.jump(1);
  }, [
    pointerEffectsEnabled,
    px,
    py,
    rotateX,
    rotateY,
    scale,
    scaleTarget,
    shouldReduceMotion,
  ]);

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
