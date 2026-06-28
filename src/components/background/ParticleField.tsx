"use client";

import { useEffect, useRef } from "react";

/** "#7c3aed" -> "rgba(124,58,237,a)". Falls back to accent violet. */
function hexToRgba(hex: string, alpha: number) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const int = parseInt(h || "7c3aed", 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lightweight 2D-canvas constellation that reacts to the mouse. Chosen over
 * React Three Fiber on purpose: ~64 particles + O(n²) links stay well under
 * 16ms/frame with zero 3D bundle cost. (Swap-in note: this is the place to drop
 * an R3F <Canvas> particle system if you want the heavier upgrade.)
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim() || "#7c3aed";

    const COUNT = 64; // keep modest for a steady 60fps
    const LINK = 120; // particle-to-particle link radius
    const CURSOR = 180; // accent link radius to the cursor
    const mouse = { x: -9999, y: -9999 };

    type P = { x: number; y: number; vx: number; vy: number };
    let pts: P[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pts.length === 0) {
        pts = Array.from({ length: COUNT }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
        }));
      }
    }

    function frame() {
      if (!running) return;
      ctx!.clearRect(0, 0, w, h);

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        // wrap around edges
        if (p.x < 0) p.x += w;
        else if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        else if (p.y > h) p.y -= h;

        // gentle pull toward the cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CURSOR) {
          const f = (1 - dist / CURSOR) * 0.02;
          p.x += dx * f;
          p.y += dy * f;
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];

        ctx!.beginPath();
        ctx!.arc(a.x, a.y, 1.2, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255,255,255,0.32)";
        ctx!.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx!.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * 0.16})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }

        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < CURSOR) {
          ctx!.strokeStyle = hexToRgba(accent, (1 - md / CURSOR) * 0.5);
          ctx!.lineWidth = 0.7;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function onMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onVisibility() {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(frame);
    }

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-70"
      aria-hidden
    />
  );
}
