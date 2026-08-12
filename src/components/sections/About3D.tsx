"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { about, researchFocus } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { EcgWaveform } from "@/components/ui/EcgWaveform";
import { AboutSignalInstrument } from "@/components/sections/AboutSignalInstrument";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * About section: no pin. Individual scroll-triggered 3D reveals
 * for lead text, body, and research focus. Continuous ECG parallax.
 */
export function About3D() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            "[data-about-identity]",
            "[data-about-lead]",
            "[data-about-body]",
            "[data-about-waves]",
            "[data-about-focus]",
          ],
          { clearProps: "all" },
        );
      });

      /* ── Desktop: individual 3D reveals (no pin) ─────────────────── */
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        // The identity arrives as one physical object before the story resolves.
        gsap.from("[data-about-identity]", {
          x: -44,
          z: -140,
          rotateY: -8,
          opacity: 0,
          duration: 1.25,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-identity]",
            start: "top 82%",
            once: true,
          },
        });

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

        // Research-focus block
        gsap.from("[data-about-focus]", {
          z: -120,
          opacity: 0,
          y: 40,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-focus]",
            start: "top 85%",
            once: true,
          },
        });
      });

      /* ── Mobile: touch-scroll 3D reveals ────────────────────────── */
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-about-identity]", {
          z: -140,
          rotateX: 4,
          rotateY: -2.5,
          opacity: 0,
          y: 30,
          scale: 0.96,
          force3D: true,
          clearProps: "transform,opacity",
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-identity]",
            start: "top 88%",
            once: true,
          },
        });

        gsap.from("[data-about-lead]", {
          z: -160,
          rotateX: 5,
          opacity: 0,
          y: 42,
          scale: 0.97,
          force3D: true,
          clearProps: "transform,opacity",
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-lead]",
            start: "top 85%",
            once: true,
          },
        });

        gsap.from(gsap.utils.toArray("[data-about-body]"), {
          z: -140,
          rotateX: 4,
          opacity: 0,
          y: 36,
          scale: 0.98,
          force3D: true,
          clearProps: "transform,opacity",
          duration: 1.05,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-body]",
            start: "top 88%",
            once: true,
          },
        });

        // Keep the signal layer responsive to native touch scrolling.
        gsap.fromTo(
          "[data-about-waves]",
          { y: 36 },
          {
            y: -36,
            force3D: true,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.45,
            },
          },
        );

        gsap.from("[data-about-focus]", {
          z: -140,
          rotateX: 4,
          opacity: 0,
          y: 38,
          scale: 0.97,
          force3D: true,
          clearProps: "transform,opacity",
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-about-focus]",
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
          <div className="about-intro-grid preserve-3d">
            <div
              data-about-identity
              className="about-identity preserve-3d"
            >
              <div>
                <h2 data-about-heading className="about-identity-title">
                  About<span aria-hidden="true">.</span>
                </h2>
                <p className="about-identity-caption">
                  From raw signal to deployed system.
                </p>
              </div>
              <AboutSignalInstrument />
            </div>

            <div className="about-story preserve-3d">
              <div className="about-story-lead preserve-3d">
                <p
                  data-about-lead
                  className="max-w-4xl text-balance text-3xl leading-[1.12] tracking-normal md:text-[3.1rem] md:tracking-tight"
                >
                  {about.lead}{" "}
                  <span className="text-[var(--color-body)]">
                    {about.leadAccent}
                  </span>
                </p>
              </div>

              <div className="about-story-body preserve-3d">
                {about.body.map((p, i) => (
                  <p
                    key={i}
                    data-about-body
                    className="body-copy"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Research interests / current focus */}
          <div
            data-about-focus
            className="mt-16 preserve-3d"
          >
            <h3 className="mb-5 text-sm font-medium text-accent">
              Research interests &amp; focus
            </h3>
            <div className="grid border-y border-line md:grid-cols-2">
              {researchFocus.map((focus) => (
                <article
                  key={focus.title}
                  data-research-focus
                  className="border-t border-line py-8 first:border-t-0 md:border-l md:border-t-0 md:px-8 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
                >
                  <h4 className="text-xl tracking-normal text-ink md:text-2xl md:tracking-tight">
                    {focus.title}
                  </h4>
                  <p className="body-copy mt-4 text-[15px] md:text-[16px]">
                    {focus.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
