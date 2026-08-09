"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { usePointerEffectsEnabled } from "@/components/motion/use-pointer-effects-enabled";

/** Magnetic pull — element drifts toward the pointer on hover, springs back. */
export function Magnetic({
  children,
  strength = 0.35,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const pointerEffectsEnabled = usePointerEffectsEnabled();
  const boundsRef = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  function move(e: React.MouseEvent) {
    if (shouldReduceMotion || !pointerEffectsEnabled) return;
    const el = ref.current;
    if (!el) return;
    const r = boundsRef.current ?? el.getBoundingClientRect();
    boundsRef.current = r;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function activate() {
    if (shouldReduceMotion || !pointerEffectsEnabled) return;
    boundsRef.current = ref.current?.getBoundingClientRect() ?? null;
  }
  function reset() {
    boundsRef.current = null;
    x.set(0);
    y.set(0);
  }

  useEffect(() => {
    if (!shouldReduceMotion && pointerEffectsEnabled) return;
    boundsRef.current = null;
    x.set(0);
    y.set(0);
    sx.jump(0);
    sy.jump(0);
  }, [pointerEffectsEnabled, shouldReduceMotion, sx, sy, x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseEnter={activate}
      onMouseMove={move}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
