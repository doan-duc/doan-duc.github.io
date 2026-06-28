"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { highlight } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { ArrowUpRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Highlight() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [active, setActive] = useState(0);

  // Decide (before paint) whether to enable the pinned/scrubbed treatment.
  useIsoLayoutEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Pin + scrub crossfade through the four phases (desktop only).
  useIsoLayoutEffect(() => {
    if (!animate) return;
    const sec = section.current;
    const st = stage.current;
    if (!sec || !st) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const panels = gsap.utils.toArray<HTMLElement>(st.querySelectorAll("[data-phase]"));
      const n = panels.length;
      gsap.set(panels, { autoAlpha: 0, yPercent: 8 });
      gsap.set(panels[0], { autoAlpha: 1, yPercent: 0 });

      let last = 0;
      const tl = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => "+=" + window.innerHeight * (n - 0.5),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(n - 1, Math.floor(self.progress * n));
            if (idx !== last) {
              last = idx;
              setActive(idx);
            }
          },
        },
      });

      for (let i = 1; i < n; i++) {
        tl.to(panels[i - 1], { autoAlpha: 0, yPercent: -8, duration: 0.5 }, i - 0.25)
          .fromTo(
            panels[i],
            { autoAlpha: 0, yPercent: 8 },
            { autoAlpha: 1, yPercent: 0, duration: 0.5 },
            i - 0.05
          );
      }
      tl.to({}, { duration: 0.5 }); // let the final phase linger
    });

    return () => {
      mm.revert();
      setActive(0);
    };
  }, [animate]);

  return (
    <section
      id="highlight"
      ref={section}
      className={cn("relative", animate && "md:h-screen md:overflow-hidden")}
    >
      <Container
        className={cn(
          "flex h-full flex-col justify-center py-24 md:grid md:grid-cols-12 md:items-center md:gap-12",
          animate ? "md:py-0" : "md:py-32"
        )}
      >
        {/* Identity column */}
        <div className="md:col-span-5">
          <span className="kicker">{highlight.eyebrow}</span>
          <h2 className="mt-6 text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-display">
            {highlight.title}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            {highlight.subtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {highlight.chips.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
          <a
            href={highlight.link.href}
            target="_blank"
            rel="noreferrer"
            className="group mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent hover:bg-accent/10"
          >
            {highlight.link.label}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Step indicator (active step turns cyan as you scrub) */}
          <ol className="mt-10 hidden space-y-3 md:block">
            {highlight.phases.map((p, i) => (
              <li
                key={p.key}
                className={cn(
                  "flex items-center gap-3 transition-colors duration-300",
                  active === i ? "text-ink" : "text-muted/45"
                )}
              >
                <span
                  className={cn(
                    "font-display text-sm transition-colors duration-300",
                    active === i ? "text-accent" : "text-muted/40"
                  )}
                >
                  {p.key}
                </span>
                <span
                  className={cn(
                    "h-px transition-all duration-300",
                    active === i ? "w-10 bg-accent" : "w-5 bg-line"
                  )}
                />
                <span className="text-sm">{p.label}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Phase stage — panels crossfade while pinned */}
        <div
          ref={stage}
          className={cn("relative md:col-span-7", animate && "md:h-[58vh]")}
        >
          {highlight.phases.map((p, i) => (
            <article
              key={p.key}
              data-phase
              className={cn(
                "flex flex-col justify-center",
                animate ? "md:absolute md:inset-0" : "md:relative",
                i > 0 && "mt-16 md:mt-0"
              )}
            >
              <div className="relative">
                {/* Blurred glow copy of the numeral */}
                <span
                  aria-hidden
                  className="num-gradient-solid pointer-events-none absolute -left-1 -top-20 select-none font-display text-[9rem] leading-none opacity-40 blur-2xl md:-top-28 md:text-[17rem]"
                >
                  {p.key}
                </span>
                {/* Visible low-alpha gradient numeral, sits behind the text */}
                <span
                  aria-hidden
                  className="num-gradient pointer-events-none absolute -left-1 -top-20 select-none font-display text-[9rem] leading-none md:-top-28 md:text-[17rem]"
                >
                  {p.key}
                </span>
                {/* Foreground copy (white, always on top) */}
                <div className="relative">
                  <div className="kicker">{p.label}</div>
                  <p className="mt-5 max-w-lg text-2xl leading-[1.3] tracking-tight text-ink/90 md:text-[1.7rem]">
                    {p.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
