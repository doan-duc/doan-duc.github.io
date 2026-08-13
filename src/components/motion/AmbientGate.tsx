"use client";

import { useEffect } from "react";

/**
 * Pauses ambient CSS loops (ECG waves, marquee, glow pulses, trace flow)
 * while their section is far off-screen, via one shared IntersectionObserver
 * over every `[data-ambient]` region. `animation-play-state` preserves phase,
 * so loops resume exactly where they paused — the visible effect is nothing;
 * the saved effect is compositor budget on long pages and battery on laptops.
 *
 * The fixed aurora blobs are exempt by construction: they always intersect —
 * they are the page's atmosphere, not a section's.
 */
export function AmbientGate() {
  useEffect(() => {
    const regions = document.querySelectorAll<HTMLElement>("[data-ambient]");
    if (regions.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-ambient-paused", !entry.isIntersecting);
        }
      },
      { rootMargin: "160px" },
    );
    regions.forEach((region) => observer.observe(region));

    return () => observer.disconnect();
  }, []);

  return null;
}
