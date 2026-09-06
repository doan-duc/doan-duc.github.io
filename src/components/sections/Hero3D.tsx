"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ArrowDown } from "@/components/ui/icons";
import { Magnetic } from "@/components/motion/Magnetic";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
// ECG-themed decoration is intentionally hidden from the public portfolio.
// import { EcgWaveform } from "@/components/ui/EcgWaveform";
import { HeroAffiliations } from "@/components/sections/HeroAffiliations";
import { DUR, EASE } from "@/lib/motion-tokens";

/**
 * Hero section: clean entrance animation only, no pin / no 3D scroll-out.
 */
export function Hero3D() {
  const { scrollTo } = useSmoothScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const enter = gsap.timeline({ defaults: { ease: EASE.enter } });
      enter
        .from("[data-hero-kicker]", { y: 14, opacity: 0, duration: DUR.fast })
        .from(
          "[data-hero-line]",
          { yPercent: 110, opacity: 0, duration: DUR.standard, stagger: 0.08 },
          "-=0.3",
        )
        .from(
          "[data-hero-sub]",
          { y: 26, opacity: 0, duration: DUR.standard },
          "-=0.55",
        )
        .from(
          "[data-hero-btns]",
          { y: 26, opacity: 0, duration: DUR.standard },
          "-=0.7",
        )
        .from(
          gsap.utils.toArray("[data-hero-stat]"),
          {
            y: 30,
            z: -24,
            rotateX: -7,
            opacity: 0,
            duration: DUR.standard,
            stagger: 0.1,
            transformOrigin: "50% 100%",
            transformPerspective: 900,
          },
          "-=0.55",
        )
        .from(
          portraitRef.current,
          { y: 24, opacity: 0, scale: 0.98, duration: DUR.standard },
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

      {/* ECG waveform layer intentionally hidden.
      <div data-ambient="" className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <EcgWaveform className="absolute left-0 top-[30%] h-12 w-full" />
        <EcgWaveform className="absolute left-[20%] top-[55%] h-10 w-[70%]" delay={2} />
        <EcgWaveform className="absolute left-[10%] top-[78%] h-8 w-[50%]" delay={4} />
      </div>
      */}

      {/* Hero glow — anchored to the content column, not the viewport, so it
          stays behind the name on ultrawide screens instead of drifting into
          the empty margin. */}
      <div
        aria-hidden
        data-ambient=""
        className="hero-glow pointer-events-none absolute bottom-[20%] left-[max(3%,calc(50%-36rem))] -z-0 h-[36vw] max-h-[520px] w-[36vw] max-w-[520px] rounded-full"
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
              className="kicker flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="hero-eyebrow-dot inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {site.available} in {site.location}
            </p>

            <h1 className="mt-7 max-w-[860px] text-[clamp(3.2rem,8.6vw,8rem)] font-semibold leading-[0.9] tracking-display md:leading-[0.88]">
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

              <div className="mt-14 max-w-[660px]">
                <HeroAffiliations animate />
              </div>
            </div>
          </div>

          {/* Portrait — plain <picture>: with `images.unoptimized` next/image
              emits no srcset anyway, and the webp variant is ~40% smaller for
              the desktop LCP element. */}
          <div ref={portraitRef} className="hidden lg:block">
            <div className="hero-stage">
              <div className="hero-portrait-panel">
                <picture>
                  <source srcSet={site.portrait.webpSrc} type="image/webp" />
                  <img
                    src={site.portrait.src}
                    alt={site.portrait.alt}
                    width={551}
                    height={709}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </Container>

    </section>
  );
}
