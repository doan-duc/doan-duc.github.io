"use client";

import { useState } from "react";
import { skillMarquee } from "@/lib/content";
import { Tag } from "@/components/ui/Tag";

/** One slow, infinite marquee row of skill pills (explicit pause toggle). */
export function Marquee() {
  const [paused, setPaused] = useState(false);
  const items = [...skillMarquee, ...skillMarquee];
  return (
    <div data-ambient="" className="group/marquee relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="marquee-track flex w-max gap-3"
        data-paused={paused ? "" : undefined}
      >
        {items.map((s, i) => (
          <Tag key={i}>{s}</Tag>
        ))}
      </div>
      <button
        type="button"
        aria-label="Toggle skills marquee motion"
        aria-pressed={paused}
        onClick={() => setPaused((current) => !current)}
        className="marquee-toggle absolute right-3 top-1/2 z-10 min-h-11 -translate-y-1/2 rounded-full border border-line bg-base/90 px-4 text-xs font-medium text-ink opacity-0 shadow-lg transition-opacity focus-visible:opacity-100 group-hover/marquee:opacity-100"
      >
        {paused ? "Play skills" : "Pause skills"}
      </button>
    </div>
  );
}
