"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ArrowDown } from "@/components/ui/icons";
import { Magnetic } from "@/components/motion/Magnetic";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

function HeroSignalPanel() {
  return (
    <div className="hero-stage">
      <div className="hero-portrait-panel">
        <Image
          src={site.portrait.src}
          alt={site.portrait.alt}
          fill
          priority
          sizes="360px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export function Hero() {
  const { scrollTo } = useSmoothScroll();
  const root = useRef<HTMLElement>(null);
  const kicker = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const rest = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const headingLines = heading.current
        ? gsap.utils.toArray<HTMLElement>(heading.current.querySelectorAll("[data-hero-line]"))
        : [];

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(kicker.current, { y: 14, opacity: 0, duration: 0.65 })
        .from(
          headingLines,
          {
            yPercent: 110,
            opacity: 0,
            duration: 0.95,
            stagger: 0.08,
          },
          "-=0.3"
        )
        .from(
          rest.current ? Array.from(rest.current.children) : [],
          { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 },
          "-=0.55"
        )
        .from(
          visual.current,
          { y: 24, opacity: 0, scale: 0.98, duration: 0.9 },
          "-=0.85"
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-10 pt-24 md:pt-28"
    >
      <div className="hero-grid-bg" aria-hidden="true" />

      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute bottom-[20%] left-[3%] -z-0 h-[36vw] max-h-[520px] w-[36vw] max-w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.34) 0%, rgba(34,211,238,0.1) 38%, transparent 68%)",
          filter: "blur(36px)",
        }}
      />

      <Container className="relative z-10 w-full">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.72fr)] lg:gap-10">
          <div>
            <p ref={kicker} className="kicker flex items-center gap-2.5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="hero-eyebrow-dot inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {site.available} - {site.location}
            </p>

            <h1
              ref={heading}
              className="mt-7 max-w-[860px] text-[clamp(3.2rem,8.6vw,8rem)] font-semibold leading-[0.88] tracking-display"
            >
              <span className="block overflow-hidden">
                <span data-hero-line className="block">Duc Doan</span>
              </span>
              <span className="block overflow-hidden">
                <span data-hero-line className="block">Sinh.</span>
              </span>
            </h1>

            <div ref={rest}>
              <p className="hero-subtitle mt-8">
                {site.summary}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Magnetic>
                  <button
                    onClick={() => scrollTo("#work")}
                    className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-transform hover:scale-[1.02]"
                  >
                    Selected work
                    <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  </button>
                </Magnetic>
                <a
                  href={`mailto:${site.email}`}
                  className="rounded-full border border-line px-6 py-3 text-sm text-ink transition-colors hover:border-accent hover:bg-accent/10"
                >
                  Get in touch
                </a>
              </div>

              <div className="mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                {site.heroStats.map((s) => (
                  <div key={s.label} className="hero-stat-card">
                    <div className="font-display text-[17px] text-ink">{s.value}</div>
                    <div className="mt-2 text-[12px] uppercase tracking-[0.1em] text-muted">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={visual} className="hidden lg:block">
            <HeroSignalPanel />
          </div>
        </div>
      </Container>

      <div className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted xl:flex">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
