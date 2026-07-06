"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { about, experience } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { EcgWaveform } from "@/components/ui/EcgWaveform";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * About section: no pin. Individual scroll-triggered 3D reveals
 * for lead text, body, and experience.  Continuous ECG parallax.
 */
export function About3D() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ── Desktop: individual 3D reveals (no pin) ─────────────────── */
      mm.add("(min-width: 1024px)", () => {
        // Lead text reveal from depth.
        gsap.from("[data-about-lead]", {
          z: -150,
          opacity: 0,
          rotateX: 4,
          y: 40,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-lead]",
            start: "top 82%",
            once: true,
          },
        });

        // Body paragraphs reveal deeper, staggered.
        gsap.from(gsap.utils.toArray("[data-about-body]"), {
          z: -200,
          opacity: 0,
          rotateX: 3,
          y: 36,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-body]",
            start: "top 85%",
            once: true,
          },
        });

        // ECG waveform continuous parallax
        gsap.fromTo(
          "[data-about-waves]",
          { y: 50 },
          {
            y: -50,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        // Experience block
        gsap.from("[data-about-exp]", {
          z: -120,
          opacity: 0,
          y: 40,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-exp]",
            start: "top 85%",
            once: true,
          },
        });
      });

      /* ── Mobile: simple reveals ──────────────────────────────────── */
      mm.add("(max-width: 1023px)", () => {
        gsap.from("[data-about-lead]", {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-lead]",
            start: "top 85%",
            once: true,
          },
        });

        gsap.from(gsap.utils.toArray("[data-about-body]"), {
          opacity: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-body]",
            start: "top 88%",
            once: true,
          },
        });

        gsap.from("[data-about-exp]", {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-exp]",
            start: "top 88%",
            once: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 md:py-32"
    >
      {/* ECG waveform ambient layer */}
      <div
        data-about-waves
        className="pointer-events-none absolute inset-0 z-0 preserve-3d"
        aria-hidden="true"
      >
        <EcgWaveform
          className="absolute left-0 top-[25%] h-10 w-full opacity-50"
          delay={1}
        />
        <EcgWaveform
          className="absolute right-0 top-[65%] h-8 w-[60%] opacity-30"
          delay={3}
        />
      </div>

      <div className="perspective-scene relative z-10 w-full">
        <Container className="preserve-3d">
          {/* Lead + body */}
          <div className="grid gap-10 border-y border-line py-12 preserve-3d md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="kicker">About</span>
            </div>
            <div className="preserve-3d md:col-span-8">
              <p
                data-about-lead
                className="max-w-4xl text-balance text-3xl leading-[1.12] tracking-normal md:text-[3.1rem] md:tracking-tight"
                style={{ willChange: "transform, opacity" }}
              >
                {about.lead}{" "}
                <span className="text-[var(--color-body)]">
                  {about.leadAccent}
                </span>
              </p>
            </div>
          </div>

          <div className="grid gap-10 border-b border-line py-10 preserve-3d md:grid-cols-12 md:gap-12 md:py-12">
            <div
              className="hidden md:col-span-4 md:block"
              aria-hidden="true"
            />
            <div className="grid gap-6 preserve-3d md:col-span-8 md:grid-cols-2">
              {about.body.map((p, i) => (
                <p
                  key={i}
                  data-about-body
                  className="body-copy"
                  style={{ willChange: "transform, opacity" }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Experience / Current Focus: clearly visible block */}
          <div
            data-about-exp
            className="mt-12 preserve-3d"
            style={{ willChange: "transform, opacity" }}
          >
            <h3 className="mb-8 text-sm font-medium text-accent">
              Current focus
            </h3>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line md:grid-cols-2">
              {experience.map((e) => (
                <div
                  key={e.role}
                  className="group bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04] md:p-8"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-semibold text-accent">
                      {e.period}
                    </span>
                    <span className="text-xs text-muted/60">{e.place}</span>
                  </div>
                  <h4 className="mt-2 text-lg tracking-normal md:text-xl md:tracking-tight">
                    {e.role}
                  </h4>
                  <div className="mt-1 text-sm text-accent/80">{e.org}</div>
                  <p className="body-copy mt-3 text-[15px]">{e.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
