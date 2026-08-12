"use client";

import { useEffect, useRef, useState } from "react";
import { observeMediaQuery } from "@/lib/media-query";

type CursorMode = "default" | "interactive" | "view" | "play" | "open" | "native";

type PointerSample = {
  x: number;
  y: number;
  target: EventTarget | null;
};

const cursorLabels: Readonly<Record<CursorMode, string>> = {
  default: "",
  interactive: "",
  view: "VIEW",
  play: "PLAY",
  open: "OPEN \u2197",
  native: "",
};

const nativeCursorSelector = [
  "dialog",
  "video",
  "input",
  "textarea",
  "select",
  "option",
  "[contenteditable='true']",
  "[data-cursor-native]",
].join(",");

const selectableTextSelector = "p,h1,h2,h3,h4,li,blockquote,code,pre";
const interactiveSelector = "a,button,[role='button'],summary";
const contextSelector = [
  nativeCursorSelector,
  "[data-cursor]",
  interactiveSelector,
  selectableTextSelector,
].join(",");
const validModes = new Set<CursorMode>(["view", "play", "open"]);

function translateTo(x: number, y: number) {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
}

function resolveCursorMode(target: EventTarget | null) {
  if (!(target instanceof Element)) return { mode: "default" as CursorMode, tone: "signal" };
  if (target.closest(nativeCursorSelector)) {
    return { mode: "native" as CursorMode, tone: "signal" };
  }

  const explicitTarget = target.closest<HTMLElement>("[data-cursor]");
  const explicitMode = explicitTarget?.dataset.cursor as CursorMode | undefined;
  if (explicitTarget && explicitMode && validModes.has(explicitMode)) {
    return { mode: explicitMode, tone: explicitTarget.dataset.cursorTone ?? explicitMode };
  }
  if (target.closest(interactiveSelector)) {
    return { mode: "interactive" as CursorMode, tone: "signal" };
  }
  if (target.closest(selectableTextSelector)) {
    return { mode: "native" as CursorMode, tone: "signal" };
  }
  return { mode: "default" as CursorMode, tone: "signal" };
}

/** Reactively enables the enhanced cursor only when the OS cursor remains safe to replace. */
function useSignalCursorEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const update = () => setEnabled(pointer.matches && !reducedMotion.matches && !forcedColors.matches);
    const cleanups = [pointer, reducedMotion, forcedColors].map((query) =>
      observeMediaQuery(query, update),
    );
    update();
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return enabled;
}

export function SignalCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const enabled = useSignalCursorEnabled();

  useEffect(() => {
    const documentRoot = document.documentElement;
    if (!enabled) {
      documentRoot.removeAttribute("data-signal-cursor-active");
      return;
    }

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const trail = trailRef.current;
    const pulse = pulseRef.current;
    if (!root || !dot || !ring || !label || !trail || !pulse) return;

    let latestSample: PointerSample | null = null;
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let previousX = 0;
    let previousY = 0;
    let previousPointerTime = performance.now();
    let lastFrameTime = performance.now();
    let trailStrength = 0;
    let trailAngle = 0;
    let initialized = false;
    let frameId: number | null = null;
    let pulseAnimation: Animation | null = null;
    let lastMode: CursorMode = "default";
    let lastTone = "signal";
    let lastContextElement: Element | null = null;
    let lastRawTarget: EventTarget | null = null;
    let suppressMouseUntil = 0;
    let inactive = true;

    const setNativeCursorActive = (active: boolean) => {
      if (documentRoot.hasAttribute("data-signal-cursor-active") === active) return;
      documentRoot.toggleAttribute("data-signal-cursor-active", active);
    };

    const setVisible = (visible: boolean) => {
      if (root.hasAttribute("data-visible") === visible) return;
      root.toggleAttribute("data-visible", visible);
    };

    const cancelPulse = () => {
      pulseAnimation?.cancel();
      pulseAnimation = null;
      pulse.removeAttribute("data-cursor-pulse-active");
    };

    const updateMode = (target: EventTarget | null, force = false) => {
      if (!force && target === lastRawTarget) return;
      lastRawTarget = target;
      const targetElement = target instanceof Element ? target : null;
      const contextElement = targetElement?.closest(contextSelector) ?? null;
      if (!force && contextElement === lastContextElement) return;
      lastContextElement = contextElement;
      const { mode, tone } = resolveCursorMode(target);
      if (force || mode !== lastMode) {
        lastMode = mode;
        root.dataset.cursorMode = mode;
        label.textContent = cursorLabels[mode];
        root.toggleAttribute("data-cursor-native-active", mode === "native");
      }
      if (force || tone !== lastTone) {
        lastTone = tone;
        root.dataset.cursorTone = tone;
      }
    };

    const deactivate = () => {
      if (inactive && frameId === null && !latestSample && !pulseAnimation) return;
      inactive = true;
      initialized = false;
      latestSample = null;
      setVisible(false);
      setNativeCursorActive(false);
      updateMode(null, true);
      trail.style.opacity = "0";
      cancelPulse();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const consumePointerSample = (now: number) => {
      const sample = latestSample;
      latestSample = null;
      if (!sample) return;

      updateMode(sample.target);
      if (lastMode === "native") {
        const needsNativeHandoff =
          !inactive ||
          root.hasAttribute("data-visible") ||
          documentRoot.hasAttribute("data-signal-cursor-active") ||
          pulseAnimation !== null;
        if (needsNativeHandoff) {
          inactive = true;
          initialized = false;
          trailStrength = 0;
          setVisible(false);
          setNativeCursorActive(false);
          trail.style.opacity = "0";
          cancelPulse();
        }
        return;
      }

      targetX = sample.x;
      targetY = sample.y;
      inactive = false;
      dot.style.transform = translateTo(targetX, targetY);
      setNativeCursorActive(true);
      setVisible(true);

      if (!initialized) {
        initialized = true;
        ringX = targetX;
        ringY = targetY;
        previousX = targetX;
        previousY = targetY;
        previousPointerTime = now;
        ring.style.transform = translateTo(ringX, ringY);
        return;
      }

      const deltaX = targetX - previousX;
      const deltaY = targetY - previousY;
      const elapsed = Math.max(8, now - previousPointerTime);
      const velocity = Math.hypot(deltaX, deltaY) / elapsed;
      trailStrength = Math.max(trailStrength, Math.min(1, Math.max(0, (velocity - 0.24) / 1.5)));
      if (deltaX !== 0 || deltaY !== 0) {
        trailAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
      }
      previousX = targetX;
      previousY = targetY;
      previousPointerTime = now;
    };

    const drawFrame = (now: number) => {
      const elapsed = Math.min(48, Math.max(1, now - lastFrameTime));
      lastFrameTime = now;
      consumePointerSample(now);
      if (inactive) {
        frameId = null;
        return;
      }

      const follow = 1 - Math.exp(-elapsed / 62);
      ringX += (targetX - ringX) * follow;
      ringY += (targetY - ringY) * follow;
      trailStrength *= Math.exp(-elapsed / 92);
      ring.style.transform = translateTo(ringX, ringY);
      trail.style.opacity = `${Math.min(0.58, trailStrength * 0.58)}`;
      trail.style.transform = [
        `translate3d(${targetX}px, ${targetY}px, 0)`,
        `rotate(${trailAngle}deg)`,
        "translate3d(-54px, -50%, 0)",
        `scaleX(${0.62 + trailStrength * 0.38})`,
      ].join(" ");

      const unsettled = Math.abs(targetX - ringX) + Math.abs(targetY - ringY) > 0.18;
      if (latestSample || unsettled || trailStrength > 0.012) {
        frameId = requestAnimationFrame(drawFrame);
      } else {
        ringX = targetX;
        ringY = targetY;
        ring.style.transform = translateTo(ringX, ringY);
        trail.style.opacity = "0";
        frameId = null;
      }
    };

    const requestCursorFrame = () => {
      if (frameId !== null) return;
      lastFrameTime = performance.now();
      frameId = requestAnimationFrame(drawFrame);
    };

    const queuePointer = (x: number, y: number, target: EventTarget | null) => {
      latestSample = { x, y, target };
      requestCursorFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        suppressMouseUntil = performance.now() + 800;
        deactivate();
        return;
      }
      queuePointer(event.clientX, event.clientY, event.target);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (performance.now() < suppressMouseUntil || "PointerEvent" in window) return;
      queuePointer(event.clientX, event.clientY, event.target);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        suppressMouseUntil = performance.now() + 800;
        deactivate();
        return;
      }
      if (lastMode === "native") return;
      cancelPulse();
      pulse.setAttribute("data-cursor-pulse-active", "");
      const position = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      pulseAnimation = pulse.animate(
        [
          { opacity: 0.72, transform: `${position} scale(0.28)` },
          { opacity: 0.28, offset: 0.48, transform: `${position} scale(1.08)` },
          { opacity: 0, transform: `${position} scale(1.72)` },
        ],
        { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      pulseAnimation.onfinish = () => {
        pulse.removeAttribute("data-cursor-pulse-active");
        pulseAnimation = null;
      };
    };

    const handleClick = (event: MouseEvent) => {
      const trigger = event.target instanceof Element
        ? event.target.closest("button[aria-haspopup='dialog']")
        : null;
      if (trigger) deactivate();
    };

    const hideOutsideViewport = (event: MouseEvent) => {
      if (!event.relatedTarget) deactivate();
    };
    const handleVisibility = () => {
      if (document.hidden) deactivate();
    };

    updateMode(null, true);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("mouseout", hideOutsideViewport, { passive: true });
    window.addEventListener("blur", deactivate, { passive: true });
    window.addEventListener("wheel", deactivate, { passive: true });
    window.addEventListener("scroll", deactivate, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      deactivate();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mouseout", hideOutsideViewport);
      window.removeEventListener("blur", deactivate);
      window.removeEventListener("wheel", deactivate);
      window.removeEventListener("scroll", deactivate);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelPulse();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      data-signal-cursor=""
      data-cursor-mode="default"
      data-cursor-tone="signal"
      aria-hidden="true"
      className="signal-cursor"
    >
      <span ref={trailRef} data-cursor-trail="" className="signal-cursor-trail">
        <svg viewBox="0 0 54 14" preserveAspectRatio="none">
          <path d="M1 7h12l3-4 4 8 4-8 4 4h25" />
        </svg>
      </span>
      <span ref={ringRef} data-cursor-ring="" className="signal-cursor-ring">
        <span ref={labelRef} data-cursor-label="" className="signal-cursor-label" />
      </span>
      <span ref={dotRef} data-cursor-dot="" className="signal-cursor-dot" />
      <span ref={pulseRef} data-cursor-pulse="" className="signal-cursor-pulse" />
    </div>
  );
}
