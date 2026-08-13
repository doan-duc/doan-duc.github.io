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
import { DEPTH, EASE, FLOW_RANGE, REST, SCRUB } from "@/lib/motion-tokens";

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
  const [motionMode, setMotionMode] = useState<
    "static" | "flow" | "pinned"
  >("static");
  const [active, setActive] = useState(0);

  // Keep the cinematic pin where it fits; every other viewport gets a
  // scroll-tied, unpinned 3D treatment unless the user requests less motion.
  useIsoLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const capableViewport = window.matchMedia(
      "(min-width: 1024px) and (min-height: 600px) and (pointer: fine)",
    );
    const update = () => {
      const nextMode = reduceMotion.matches
        ? "static"
        : capableViewport.matches
          ? "pinned"
          : "flow";

      setMotionMode((currentMode) =>
        currentMode === nextMode ? currentMode : nextMode,
      );
    };

    update();
    const stopObservingReduceMotion = observeMediaQuery(reduceMotion, update);
    const stopObservingViewport = observeMediaQuery(capableViewport, update);

    return () => {
      stopObservingReduceMotion();
      stopObservingViewport();
    };
  }, []);

  // Scrub through all four phases. Large fine-pointer screens use the pinned
  // depth stack; touch, compact, and short screens reveal the same phases in
  // normal document flow so content can never be clipped by a pin.
  useIsoLayoutEffect(() => {
    if (motionMode === "static") {
      setActive(0);
      return;
    }

    const ctx = gsap.context(() => {
      const st = stageRef.current;
      if (!st) return;

      const panels = gsap.utils.toArray<HTMLElement>(
        st.querySelectorAll("[data-phase]"),
      );
      const n = panels.length;
      if (n === 0) return;

      const showPhase = (index: number) => {
        const boundedIndex = Math.max(0, Math.min(n - 1, index));
        setActive((currentIndex) =>
          currentIndex === boundedIndex ? currentIndex : boundedIndex,
        );
      };

      if (motionMode === "pinned") {
        // First panel visible, rest hidden at depth.
        gsap.set(panels, { autoAlpha: 0, z: DEPTH.mid, rotateX: 4 });
        gsap.set(panels[0], { autoAlpha: 1, z: 0, rotateX: 0 });

        let lastIdx = 0;
        const tl = gsap.timeline({
          defaults: { ease: EASE.crossfade },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * (n - 0.5),
            pin: true,
            scrub: SCRUB.smooth,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(n - 1, Math.floor(self.progress * n));
              if (idx !== lastIdx) {
                lastIdx = idx;
                showPhase(idx);
              }
            },
          },
        });

        for (let i = 1; i < n; i++) {
          // Previous phase exits forward (toward viewer).
          tl.to(
            panels[i - 1],
            { autoAlpha: 0, z: -DEPTH.mid, rotateX: -3, duration: 0.5 },
            i - 0.25,
          );
          // Next phase enters from depth.
          tl.fromTo(
            panels[i],
            { autoAlpha: 0, z: DEPTH.mid, rotateX: 4 },
            { autoAlpha: 1, z: 0, rotateX: 0, duration: 0.5 },
            i - 0.05,
          );
        }
        tl.to({}, { duration: 0.5 });
        return;
      }

      panels.forEach((panel, index) => {
        const rotateY = index % 2 === 0 ? -4 : 4;

        // Rest state shares REST.dim with the word wipe: one page-wide
        // vocabulary for "unread".
        gsap.fromTo(
          panel,
          {
            opacity: REST.dim,
            z: DEPTH.shallow,
            y: 52,
            rotateX: 7,
            rotateY,
            scale: 0.96,
          },
          {
            opacity: 1,
            z: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: panel,
              start: FLOW_RANGE.start,
              end: FLOW_RANGE.end,
              scrub: SCRUB.smooth,
              invalidateOnRefresh: true,
              onEnter: () => showPhase(index),
              onEnterBack: () => showPhase(index),
              onLeaveBack: () => showPhase(index - 1),
              onUpdate: (self) => {
                if (self.direction > 0 && self.progress >= 0.42) {
                  showPhase(index);
                } else if (self.direction < 0 && self.progress < 0.28) {
                  showPhase(index - 1);
                }
              },
            },
          },
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      setActive(0);
    };
  }, [motionMode]);

  return (
    <section
      id="featured"
      ref={sectionRef}
      data-featured-motion={motionMode}
      className="relative overflow-x-clip"
    >
      <div className="perspective-scene h-full min-h-[inherit]">
        <Container className="featured-container flex min-h-[inherit] flex-col justify-center preserve-3d py-24 md:grid md:grid-cols-12 md:items-center md:gap-12 md:py-32">
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
                  aria-current={active === i ? "step" : undefined}
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
            data-featured-stage
            className="relative preserve-3d md:col-span-7"
          >
            {highlight.phases.map((p, i) => (
              <article
                key={p.key}
                data-phase
                data-phase-index={i}
                className={cn(
                  "phase-panel-3d flex flex-col justify-center md:relative",
                  i > 0 && "mt-16",
                )}
              >
                <div className="relative">
                  {/* Blurred glow copy of numeral */}
                  <span
                    aria-hidden
                    className="num-gradient-solid pointer-events-none absolute -left-1 -top-20 select-none font-display text-[9rem] leading-none opacity-40 blur-2xl md:-top-[clamp(5rem,16vh,7rem)] md:text-[clamp(9rem,24vh,17rem)]"
                  >
                    {p.key}
                  </span>
                  {/* Low-alpha gradient numeral */}
                  <span
                    aria-hidden
                    className="num-gradient pointer-events-none absolute -left-1 -top-20 select-none font-display text-[9rem] leading-none md:-top-[clamp(5rem,16vh,7rem)] md:text-[clamp(9rem,24vh,17rem)]"
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
