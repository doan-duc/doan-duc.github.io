import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { MaskReveal } from "@/components/motion/MaskReveal";

/** Editorial section heading: accent kicker + clip-path-revealed title + index. */
export function SectionHeader({
  index,
  kicker,
  title,
  className,
}: {
  index?: string;
  kicker: string;
  title: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-3xl">
        <Reveal>
          <span className="kicker">{kicker}</span>
        </Reveal>
        <MaskReveal
          as="h2"
          className="mt-5 text-4xl tracking-display sm:text-5xl md:text-6xl"
        >
          {title}
        </MaskReveal>
      </div>
      {index && (
        <Reveal>
          <span className="font-display text-sm text-muted">{index}</span>
        </Reveal>
      )}
    </div>
  );
}
