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
import { observeMediaQuery } from "@/lib/media-query";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Separate pinned section for the featured ECG-reconstruction research.
 * Phases crossfade with 3D depth transitions (enter from Z-200, exit to Z+200).
 */
export function FeaturedResearch3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [active, setActive] = useState(0);

  // Decide whether to enable the pinned 3D treatment
  useIsoLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const capableViewport = window.matchMedia(
      "(min-width: 1024px) and (min-height: 700px) and (pointer: fine)",
    );
    const update = () =>
      setAnimate(!reduceMotion.matches && capableViewport.matches);

    update();
    const stopObservingReduceMotion = observeMediaQuery(reduceMotion, update);
    const stopObservingViewport = observeMediaQuery(capableViewport, update);

    return () => {
      stopObservingReduceMotion();
      stopObservingViewport();
    };
  }, []);

  // Pin + scrub crossfade through the four research phases (desktop only)
  useIsoLayoutEffect(() => {
    if (!animate) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (min-height: 700px) and (pointer: fine)",
        () => {
          const st = stageRef.current;
          if (!st) return;

          const panels = gsap.utils.toArray<HTMLElement>(
            st.querySelectorAll("[data-phase]"),
          );
          const n = panels.length;

          // First panel visible, rest hidden at depth
          gsap.set(panels, { autoAlpha: 0, z: -200, rotateX: 4 });
          gsap.set(panels[0], { autoAlpha: 1, z: 0, rotateX: 0 });

          let lastIdx = 0;
          const tl = gsap.timeline({
            defaults: { ease: "power1.inOut" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * (n - 0.5),
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const idx = Math.min(
                  n - 1,
                  Math.floor(self.progress * n),
                );
                if (idx !== lastIdx) {
                  lastIdx = idx;
                  setActive(idx);
                }
              },
            },
          });

          for (let i = 1; i < n; i++) {
            // Previous phase exits forward (toward viewer)
            tl.to(
              panels[i - 1],
              { autoAlpha: 0, z: 200, rotateX: -3, duration: 0.5 },
              i - 0.25,
            );
            // Next phase enters from depth
            tl.fromTo(
              panels[i],
              { autoAlpha: 0, z: -200, rotateX: 4 },
              { autoAlpha: 1, z: 0, rotateX: 0, duration: 0.5 },
              i - 0.05,
            );
          }
          tl.to({}, { duration: 0.5 }); // linger on final phase
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
      setActive(0);
    };
  }, [animate]);

  return (
    <section
      id="featured"
      ref={sectionRef}
      className={cn("relative", animate && "md:min-h-[100dvh] md:overflow-hidden")}
    >
      <div className="perspective-scene h-full min-h-[inherit]">
        <Container
          className={cn(
            "flex min-h-[inherit] flex-col justify-center preserve-3d py-24 md:grid md:grid-cols-12 md:items-center md:gap-12",
            animate ? "md:py-0" : "md:py-32",
          )}
        >
          {/* Identity column */}
          <div className="min-w-0 md:col-span-5">
            <span className="kicker">{highlight.eyebrow}</span>
            <h2 className="mt-6 max-w-full text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-display [overflow-wrap:anywhere]">
              {highlight.title}
            </h2>
            <p className="body-copy mt-6 max-w-md">{highlight.subtitle}</p>
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

            {/* Phase indicator (desktop) */}
            <ol className="mt-10 hidden space-y-3 md:block">
              {highlight.phases.map((p, i) => (
                <li
                  key={p.key}
                  className={cn(
                    "flex items-center gap-3 transition-colors duration-300",
                    active === i ? "text-ink" : "text-muted/45",
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-sm transition-colors duration-300",
                      active === i ? "text-accent" : "text-muted/40",
                    )}
                  >
                    {p.key}
                  </span>
                  <span
                    className={cn(
                      "h-px transition-all duration-300",
                      active === i ? "w-10 bg-accent" : "w-5 bg-line",
                    )}
                  />
                  <span className="text-sm">{p.label}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Phase stage: panels crossfade with 3D depth */}
          <div
            ref={stageRef}
            className={cn(
              "relative preserve-3d md:col-span-7",
              animate && "md:h-[58vh]",
            )}
          >
            {highlight.phases.map((p, i) => (
              <article
                key={p.key}
                data-phase
                className={cn(
                  "phase-panel-3d flex flex-col justify-center",
                  animate ? "md:absolute md:inset-0" : "md:relative",
                  i > 0 && (animate ? "mt-16 md:mt-0" : "mt-16"),
                )}
              >
                <div className="relative">
                  {/* Blurred glow copy of numeral */}
                  <span
                    aria-hidden
                    className="num-gradient-solid pointer-events-none absolute -left-1 -top-20 select-none font-display text-[9rem] leading-none opacity-40 blur-2xl md:-top-28 md:text-[17rem]"
                  >
                    {p.key}
                  </span>
                  {/* Low-alpha gradient numeral */}
                  <span
                    aria-hidden
                    className="num-gradient pointer-events-none absolute -left-1 -top-20 select-none font-display text-[9rem] leading-none md:-top-28 md:text-[17rem]"
                  >
                    {p.key}
                  </span>
                  {/* Foreground content */}
                  <div className="relative">
                    <div className="text-sm font-medium text-accent">
                      {p.label}
                    </div>
                    <p className="body-copy mt-5 max-w-lg">{p.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
