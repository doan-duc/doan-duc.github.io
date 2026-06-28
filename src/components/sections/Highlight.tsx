"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { highlight } from "@/lib/content";
import { Tag } from "@/components/ui/Tag";
import { ArrowUpRight } from "@/components/ui/icons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The flagship project, pinned. On desktop the section pins and the panels
 * scroll horizontally (Awwwards-style). On mobile it gracefully degrades to a
 * normal vertical stack. Driven by gsap.matchMedia so the pin only exists where
 * it should.
 */
export function Highlight() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="highlight"
      ref={sectionRef}
      className="relative md:h-screen md:overflow-hidden"
    >
      <div
        ref={trackRef}
        className="flex flex-col md:h-screen md:flex-row md:flex-nowrap"
      >
        {/* Intro panel */}
        <div className="flex min-h-[88vh] w-full shrink-0 flex-col justify-center px-6 py-20 md:h-screen md:w-[62vw] md:px-16 md:py-0">
          <span className="kicker">{highlight.eyebrow}</span>
          <h2 className="mt-6 max-w-3xl text-[clamp(2.5rem,7vw,6rem)] leading-[0.92] tracking-display">
            {highlight.title}
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            {highlight.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {highlight.chips.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
          <a
            href={highlight.link.href}
            target="_blank"
            rel="noreferrer"
            className="group mt-9 inline-flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent hover:bg-accent/10"
          >
            {highlight.link.label}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Desktop-only scroll hint */}
          <div className="mt-14 hidden items-center gap-3 text-muted md:flex">
            <span className="text-[10px] uppercase tracking-[0.3em]">
              Scroll to explore
            </span>
            <span className="h-px w-16 bg-gradient-to-r from-accent to-transparent" />
          </div>
        </div>

        {/* Phase panels: Problem → Built → Learned → Why */}
        {highlight.phases.map((phase) => (
          <article
            key={phase.key}
            className="relative flex min-h-[70vh] w-full shrink-0 flex-col justify-center border-t border-line px-6 py-16 md:h-screen md:w-[44vw] md:border-l md:border-t-0 md:px-14 md:py-0"
          >
            {/* Oversized outline index */}
            <span
              aria-hidden
              className="font-display text-[7rem] leading-none text-transparent md:text-[10rem]"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.12)" }}
            >
              {phase.key}
            </span>
            <div className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              {phase.label}
            </div>
            <p className="mt-5 max-w-md text-2xl leading-[1.3] tracking-tight text-ink/90 md:text-[1.7rem]">
              {phase.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
