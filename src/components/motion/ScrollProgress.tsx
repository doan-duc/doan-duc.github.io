"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { SPRING } from "@/lib/motion-tokens";

/** Top progress bar, filled with the cyan→violet atmosphere gradient. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const smoothed = useSpring(scrollYProgress, SPRING.heavy);
  // Reduced motion keeps the position readout but stops the spring physics.
  const scaleX = shouldReduceMotion ? scrollYProgress : smoothed;

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--grad-cyan), var(--grad-blue), var(--grad-violet))",
      }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
    />
  );
}
