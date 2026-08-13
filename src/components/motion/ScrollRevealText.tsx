"use client";

import {
  Fragment,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { REST, WIPE_RANGE } from "@/lib/motion-tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Resting dimness of an unread word. Low enough to read as "not yet here". */
const restOpacity = REST.dim;
/**
 * How many words sit mid-fade at once. The leading edge reads as a soft wipe
 * rather than a row of switches flicking on.
 */
const softness = 1.6;

type ScrollRevealTextProps = Omit<
  ComponentPropsWithoutRef<"p">,
  "children" | "ref"
> & {
  children: string;
  as?: ElementType;
  start?: string;
  end?: string;
};

/**
 * Scroll-scrubbed word wipe. The copy rests dim and lights up word by word as
 * the block crosses the viewport, so reading is paced by the scroll instead of
 * arriving all at once.
 *
 * Opacity only — no transform, no layout read, no compositor promotion — and
 * the markup ships fully legible, so no-JS and reduced-motion readers get plain
 * text rather than a paragraph stuck at 12%.
 */
export function ScrollRevealText({
  children,
  as,
  className,
  start = WIPE_RANGE.start,
  end = WIPE_RANGE.end,
  ...rest
}: ScrollRevealTextProps) {
  const Tag = (as ?? "p") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = gsap.utils.toArray<HTMLElement>(
      element.querySelectorAll("[data-reveal-word]"),
    );
    if (words.length === 0) return;

    // A staggered tween per word means GSAP re-evaluates every word on every
    // tick — hundreds of child tweens across the page, all through a scroll.
    // The wipe is a pure function of progress, so drive it directly and touch
    // only the handful of words whose opacity actually moved this frame.
    const total = words.length;
    const written = new Array<number>(total).fill(Number.NaN);
    let previousHead = Number.NaN;

    const opacityAt = (index: number, head: number) => {
      const ramp = (head - index) / softness;
      const eased = ramp <= 0 ? 0 : ramp >= 1 ? 1 : ramp;
      return restOpacity + (1 - restOpacity) * eased;
    };

    const writeWord = (index: number, head: number) => {
      const next = Math.round(opacityAt(index, head) * 100) / 100;
      if (written[index] === next) return;
      written[index] = next;
      words[index].style.opacity = `${next}`;
    };

    const applyProgress = (progress: number) => {
      const head = progress * (total + softness);
      if (Number.isNaN(previousHead)) {
        for (let index = 0; index < total; index += 1) writeWord(index, head);
        previousHead = head;
        return;
      }
      // Only the band the leading edge swept since the last frame can differ.
      const low = Math.max(0, Math.floor(Math.min(head, previousHead) - softness) - 1);
      const high = Math.min(total - 1, Math.ceil(Math.max(head, previousHead)) + 1);
      for (let index = low; index <= high; index += 1) writeWord(index, head);
      previousHead = head;
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start,
        end,
        scrub: true,
        // The research section pins, which inserts spacer height and moves
        // everything below it. These triggers must recompute after that pin has
        // resolved, or every block below inherits stale start/end and sits
        // permanently lit.
        refreshPriority: -1,
        onUpdate: (self) => applyProgress(self.progress),
        // Past either edge the trigger stops updating, so settle the ends.
        onLeave: () => applyProgress(1),
        onLeaveBack: () => applyProgress(0),
      });
      applyProgress(0);
    }, ref);

    return () => {
      ctx.revert();
      for (const word of words) word.style.removeProperty("opacity");
    };
  }, []);

  const words = children.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          <span data-reveal-word className="reveal-word">
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </Tag>
  );
}
