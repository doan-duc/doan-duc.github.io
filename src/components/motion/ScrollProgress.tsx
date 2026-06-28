"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Top progress bar, filled with the cyan→violet atmosphere gradient. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.25,
  });

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
