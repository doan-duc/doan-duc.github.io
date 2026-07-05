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
import { EcgWaveform } from "@/components/ui/EcgWaveform";

/**
 * Hero section — clean entrance animation only, no pin / no 3D scroll-out.
 */
export function Hero3D() {
  const { scrollTo } = useSmoothScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const enter = gsap.timeline({ defaults: { ease: "power4.out" } });
      enter
        .from("[data-hero-kicker]", { y: 14, opacity: 0, duration: 0.65 })
        .from(
          "[data-hero-line]",
          { yPercent: 110, opacity: 0, duration: 0.95, stagger: 0.08 },
          "-=0.3",
        )
        .from(
          "[data-hero-sub]",
          { y: 26, opacity: 0, duration: 0.9 },
          "-=0.55",
        )
        .from(
          "[data-hero-btns]",
          { y: 26, opacity: 0, duration: 0.9 },
          "-=0.7",
        )
        .from(
          gsap.utils.toArray("[data-hero-stat]"),
          { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 },
          "-=0.55",
        )
        .from(
          portraitRef.current,
          { y: 24, opacity: 0, scale: 0.98, duration: 0.9 },
          "-=0.85",
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#0a0a0a] pb-10 pt-24 md:pt-28"
    >
      {/* Background grid */}
      <div className="hero-grid-bg" aria-hidden="true" />

      {/* Subtle ECG waveform layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <EcgWaveform className="absolute left-0 top-[30%] h-12 w-full" />
        <EcgWaveform
          className="absolute left-[20%] top-[55%] h-10 w-[70%]"
          delay={2}
        />
        <EcgWaveform
          className="absolute left-[10%] top-[78%] h-8 w-[50%]"
          delay={4}
        />
      </div>

      {/* Hero glow */}
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
          {/* Text group */}
          <div>
            <p
              data-hero-kicker
              className="kicker flex items-center gap-2.5"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="hero-eyebrow-dot inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {site.available} — {site.location}
            </p>

            <h1
              data-hero-heading
              className="mt-7 max-w-[860px] text-[clamp(3.2rem,8.6vw,8rem)] font-semibold leading-[0.88] tracking-display"
            >
              <span className="block overflow-hidden">
                <span data-hero-line className="block">
                  Duc Doan
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-hero-line className="block">
                  Sinh.
                </span>
              </span>
            </h1>

            <div>
              <p data-hero-sub className="hero-subtitle mt-8">
                {site.summary}
              </p>

              <div
                data-hero-btns
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Magnetic>
                  <button
                    onClick={() => scrollTo("#projects")}
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
                  <div key={s.label} data-hero-stat className="hero-stat-card">
                    <div className="font-display text-[17px] text-ink">
                      {s.value}
                    </div>
                    <div className="mt-2 text-[12px] uppercase tracking-[0.1em] text-muted">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Portrait */}
          <div ref={portraitRef} className="hidden lg:block">
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
          </div>
        </div>
      </Container>

    </section>
  );
}
