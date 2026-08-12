"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { usePointerEffectsEnabled } from "@/components/motion/use-pointer-effects-enabled";

type CursorMode = "default" | "interactive" | "view" | "play" | "open" | "native";

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

const interactiveSelector = "a,button,[role='button'],summary";
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
  if (explicitMode && validModes.has(explicitMode)) {
    return {
      mode: explicitMode,
      tone: explicitTarget?.dataset.cursorTone ?? explicitMode,
    };
  }

  if (target.closest(interactiveSelector)) {
    return { mode: "interactive" as CursorMode, tone: "signal" };
  }

  return { mode: "default" as CursorMode, tone: "signal" };
}

export function SignalCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const pointerEffectsEnabled = usePointerEffectsEnabled();
  const shouldReduceMotion = useReducedMotion();
  const enabled = pointerEffectsEnabled && shouldReduceMotion === false;

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

    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let previousX = 0;
    let previousY = 0;
    let previousPointerTime = performance.now();
    let lastPointerEventTime = 0;
    let lastPointerEventTarget: EventTarget | null = null;
    let lastPointerEventX = Number.NaN;
    let lastPointerEventY = Number.NaN;
    let lastFrameTime = performance.now();
    let trailStrength = 0;
    let trailAngle = 0;
    let initialized = false;
    let frameId: number | null = null;
    let contextProbeTimer: number | null = null;
    let contextProbeAttempts = 0;
    let pulseAnimation: Animation | null = null;
    let lastMode: CursorMode = "default";
    let lastTone = "signal";
    let lastContextTarget: EventTarget | null = null;
    let cachedViewContainer: HTMLElement | null = null;
    let cachedNestedZones: Array<{
      mode: CursorMode;
      tone: string;
      left: number;
      right: number;
      top: number;
      bottom: number;
    }> = [];

    const setNativeCursorActive = (active: boolean) => {
      documentRoot.toggleAttribute("data-signal-cursor-active", active);
    };

    const resolveModeWithCachedZones = (
      target: EventTarget | null,
      x?: number,
      y?: number,
      refreshZones = false,
    ) => {
      const targetElement = target instanceof Element ? target : null;
      const viewContainer = targetElement?.closest<HTMLElement>("[data-cursor='view']") ?? null;
      if (viewContainer !== cachedViewContainer || refreshZones) {
        cachedViewContainer = viewContainer;
        cachedNestedZones = viewContainer
          ? Array.from(
              viewContainer.querySelectorAll<HTMLElement>(
                "[data-cursor='play'],[data-cursor='open']",
              ),
            ).map((element) => {
              const rect = element.getBoundingClientRect();
              const mode = element.dataset.cursor as CursorMode;
              return {
                mode,
                tone: element.dataset.cursorTone ?? mode,
                left: rect.left - 8,
                right: rect.right + 8,
                top: rect.top - 8,
                bottom: rect.bottom + 8,
              };
            })
          : [];
      }

      if (x !== undefined && y !== undefined) {
        const nestedZone = cachedNestedZones.find(
          ({ left, right, top, bottom }) =>
            x >= left && x <= right && y >= top && y <= bottom,
        );
        if (nestedZone) return { mode: nestedZone.mode, tone: nestedZone.tone };
      }

      return resolveCursorMode(target);
    };

    const updateMode = (
      target: EventTarget | null,
      force = false,
      x?: number,
      y?: number,
    ) => {
      if (!force && target === lastContextTarget && cachedNestedZones.length === 0) return;
      const targetChanged = target !== lastContextTarget;
      lastContextTarget = target;
      const { mode, tone } = resolveModeWithCachedZones(target, x, y, targetChanged);
      if (!force && mode === lastMode && tone === lastTone) return;

      lastMode = mode;
      lastTone = tone;
      root.dataset.cursorMode = mode;
      root.dataset.cursorTone = tone;
      label.textContent = cursorLabels[mode];
      root.toggleAttribute("data-cursor-native-active", mode === "native");
    };

    const drawFrame = (now: number) => {
      const elapsed = Math.min(48, Math.max(1, now - lastFrameTime));
      lastFrameTime = now;
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
      if (unsettled || trailStrength > 0.012) {
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

    const probeNestedContextAfterTilt = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const viewContainer = target.closest<HTMLElement>("[data-cursor='view']");
      if (
        !viewContainer?.querySelector("[data-cursor='play'],[data-cursor='open']") ||
        contextProbeTimer !== null
      ) {
        return;
      }

      contextProbeAttempts = 0;
      const probe = () => {
        const hitTarget = document.elementFromPoint(targetX, targetY);
        const resolvedMode = resolveCursorMode(hitTarget).mode;
        updateMode(hitTarget, true, targetX, targetY);
        contextProbeAttempts += 1;
        if (resolvedMode === "view" && contextProbeAttempts < 8) {
          contextProbeTimer = window.setTimeout(probe, 80);
        } else {
          contextProbeTimer = null;
        }
      };
      contextProbeTimer = window.setTimeout(probe, 80);
    };

    const updateCursorFromPointer = (
      clientX: number,
      clientY: number,
      target: EventTarget | null,
      pointerType: string,
    ) => {
      if (pointerType === "touch") {
        root.removeAttribute("data-visible");
        setNativeCursorActive(false);
        return;
      }

      setNativeCursorActive(true);
      targetX = clientX;
      targetY = clientY;
      dot.style.transform = translateTo(targetX, targetY);
      root.setAttribute("data-visible", "");
      updateMode(target, false, targetX, targetY);
      probeNestedContextAfterTilt(target);

      const now = performance.now();
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
      requestCursorFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastPointerEventTime = performance.now();
      lastPointerEventTarget = event.target;
      lastPointerEventX = event.clientX;
      lastPointerEventY = event.clientY;
      updateCursorFromPointer(
        event.clientX,
        event.clientY,
        event.target,
        event.pointerType,
      );
    };

    const handleMouseMove = (event: MouseEvent) => {
      const duplicatePointerEvent =
        performance.now() - lastPointerEventTime < 8 &&
        event.target === lastPointerEventTarget &&
        event.clientX === lastPointerEventX &&
        event.clientY === lastPointerEventY;
      if (duplicatePointerEvent) return;
      updateCursorFromPointer(event.clientX, event.clientY, event.target, "mouse");
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || lastMode === "native") return;
      pulseAnimation?.cancel();
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

    const hideCursor = () => {
      root.removeAttribute("data-visible");
    };

    const hideCursorOutsideViewport = (event: MouseEvent) => {
      if (event.relatedTarget) return;
      hideCursor();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        root.removeAttribute("data-visible");
        setNativeCursorActive(false);
      }
    };

    const resetContextForWheel = () => updateMode(null, true);

    documentRoot.setAttribute("data-signal-cursor-active", "");
    updateMode(null, true);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("mouseout", hideCursorOutsideViewport, { passive: true });
    window.addEventListener("blur", hideCursor, { passive: true });
    window.addEventListener("wheel", resetContextForWheel, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      documentRoot.removeAttribute("data-signal-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("mouseout", hideCursorOutsideViewport);
      window.removeEventListener("blur", hideCursor);
      window.removeEventListener("wheel", resetContextForWheel);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (frameId !== null) cancelAnimationFrame(frameId);
      if (contextProbeTimer !== null) window.clearTimeout(contextProbeTimer);
      pulseAnimation?.cancel();
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
