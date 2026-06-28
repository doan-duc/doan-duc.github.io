"use client";

import { skillMarquee } from "@/lib/content";
import { Tag } from "@/components/ui/Tag";

/** One slow, infinite marquee row of skill pills (pauses on hover). */
export function Marquee() {
  const items = [...skillMarquee, ...skillMarquee];
  return (
    <div className="relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="marquee-track flex w-max gap-3">
        {items.map((s, i) => (
          <Tag key={i}>{s}</Tag>
        ))}
      </div>
    </div>
  );
}
