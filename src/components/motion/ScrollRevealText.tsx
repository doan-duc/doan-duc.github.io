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

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Resting dimness of an unread word. Low enough to read as "not yet here". */
const restOpacity = 0.12;
/**
 * Word tween length against the gap between words: the ratio is how many words
 * sit mid-fade at once, so the leading edge reads as a soft wipe rather than a
 * row of switches flicking on.
 */
const wordDuration = 0.6;
const wordStagger = 0.4;

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
  start = "top 85%",
  end = "bottom 60%",
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

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: restOpacity },
        {
          opacity: 1,
          ease: "none",
          duration: wordDuration,
          stagger: wordStagger,
          scrollTrigger: { trigger: element, start, end, scrub: true },
        },
      );
    }, ref);

    return () => ctx.revert();
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
