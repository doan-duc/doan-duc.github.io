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
  stiffness: 300,
  damping: 20,
  mass: 0.3,
};

const glareSpring: TiltSpring = {
  stiffness: 280,
  damping: 24,
  mass: 0.3,
};

const layerReleaseDelayMs = 480;
const touchTiltStrength = 0.62;
const touchPressScale = 0.992;

/** 3D tilt toward the pointer (Framer micro-interaction). Keep `max` low. */
export function TiltCard({
  children,
  className,
  max = 5.5,
  hoverScale = 1.012,
  spring = defaultSpring,
  glare = false,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  hoverScale?: number;
  spring?: TiltSpring;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const layerReleaseTimerRef = useRef<number | null>(null);
  const activeTouchPointerRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const pointerEffectsEnabled = usePointerEffectsEnabled();
  const boundsRef = useRef<DOMRect | null>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const scaleTarget = useMotionValue(1);
  const glareOpacityTarget = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const scale = useSpring(scaleTarget, spring);
  const glareX = useTransform(px, [-0.5, 0.5], [-52, 52]);
  const glareY = useTransform(py, [-0.5, 0.5], [-24, 24]);
  const glareOpacity = useSpring(glareOpacityTarget, glareSpring);

  function clearLayerReleaseTimer() {
    if (layerReleaseTimerRef.current === null) return;
    window.clearTimeout(layerReleaseTimerRef.current);
    layerReleaseTimerRef.current = null;
  }

  function updateTiltFromPointer(e: React.PointerEvent, strength = 1) {
    const el = ref.current;
    if (!el) return;
    const r = boundsRef.current ?? el.getBoundingClientRect();
    boundsRef.current = r;
    const normalizedX = Math.min(
      0.5,
      Math.max(-0.5, (e.clientX - r.left) / r.width - 0.5),
    );
    const normalizedY = Math.min(
      0.5,
      Math.max(-0.5, (e.clientY - r.top) / r.height - 0.5),
    );
    px.set(normalizedX * strength);
    py.set(normalizedY * strength);
  }

  function handleMove(e: React.PointerEvent) {
    if (shouldReduceMotion) return;

    if (e.pointerType === "touch") {
      if (activeTouchPointerRef.current !== e.pointerId) return;
      updateTiltFromPointer(e, touchTiltStrength);
      return;
    }

    if (!pointerEffectsEnabled) return;
    updateTiltFromPointer(e);
  }

  function activate(e: React.PointerEvent) {
    if (shouldReduceMotion || !pointerEffectsEnabled) return;
    if (e.pointerType === "touch") return;
    clearLayerReleaseTimer();
    ref.current?.setAttribute("data-tilt-active", "");
    boundsRef.current = ref.current?.getBoundingClientRect() ?? null;
    scaleTarget.set(hoverScale);
    glareOpacityTarget.set(1);
  }

  function press(e: React.PointerEvent) {
    if (shouldReduceMotion || e.pointerType !== "touch") return;
    clearLayerReleaseTimer();
    activeTouchPointerRef.current = e.pointerId;
    ref.current?.setAttribute("data-tilt-active", "");
    boundsRef.current = ref.current?.getBoundingClientRect() ?? null;
    updateTiltFromPointer(e, touchTiltStrength);
    scaleTarget.set(touchPressScale);
    glareOpacityTarget.set(0.72);
  }

  function release(e: React.PointerEvent) {
    if (
      e.pointerType !== "touch" ||
      activeTouchPointerRef.current !== e.pointerId
    ) {
      return;
    }
    reset();
  }

  function reset() {
    activeTouchPointerRef.current = null;
    boundsRef.current = null;
    px.set(0);
    py.set(0);
    scaleTarget.set(1);
    glareOpacityTarget.set(0);
    clearLayerReleaseTimer();
    layerReleaseTimerRef.current = window.setTimeout(() => {
      ref.current?.removeAttribute("data-tilt-active");
      layerReleaseTimerRef.current = null;
    }, layerReleaseDelayMs);
  }

  useEffect(() => {
    if (!shouldReduceMotion && pointerEffectsEnabled) return;
    clearLayerReleaseTimer();
    activeTouchPointerRef.current = null;
    boundsRef.current = null;
    ref.current?.removeAttribute("data-tilt-active");
    px.set(0);
    py.set(0);
    scaleTarget.set(1);
    glareOpacityTarget.set(0);
    rotateX.jump(0);
    rotateY.jump(0);
    scale.jump(1);
    glareOpacity.jump(0);
  }, [
    glareOpacity,
    glareOpacityTarget,
    pointerEffectsEnabled,
    px,
    py,
    rotateX,
    rotateY,
    scale,
    scaleTarget,
    shouldReduceMotion,
  ]);

  useEffect(
    () => () => {
      if (layerReleaseTimerRef.current !== null) {
        window.clearTimeout(layerReleaseTimerRef.current);
      }
    },
    [],
  );

  return (
    <div
      ref={ref}
      data-tilt-card=""
      onPointerEnter={activate}
      onPointerDown={press}
      onPointerMove={handleMove}
      onPointerUp={release}
      onPointerLeave={reset}
      onPointerCancel={reset}
      className="tilt-card-hit-area relative"
    >
      <motion.div
        data-tilt-surface=""
        style={{
          rotateX,
          rotateY,
          scale,
          transformPerspective: 900,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        className={cn("tilt-card relative", className)}
      >
        {glare ? (
          <motion.span
            aria-hidden="true"
            data-tilt-glare=""
            className="tilt-card-glare"
            style={{ x: glareX, y: glareY, opacity: glareOpacity, z: 4 }}
          />
        ) : null}
        {children}
      </motion.div>
    </div>
  );
}
