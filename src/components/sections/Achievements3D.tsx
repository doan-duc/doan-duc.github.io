"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { recognition, recognitionMoments } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Inline location-pin icon ───────────────────────────────────────── */
function LocationPin() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

/**
 * Achievements section: 3D timeline with alternating rotateY reveals.
 * Timeline connector draws via scaleY, each node enters from depth.
 * Photo grid retained with Reveal stagger.
 */
export function Achievements3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ── Desktop: 3D depth reveals ───────────────────────────────── */
      mm.add("(min-width: 1024px)", () => {
        // Timeline connector draws
        if (lineRef.current) {
          gsap.from(lineRef.current, {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: lineRef.current,
              start: "top 80%",
              once: true,
            },
          });
        }

        // Each node reveals from depth with alternating rotateY
        const nodes = gsap.utils.toArray<HTMLElement>(
          "[data-achievement-node]",
        );
        nodes.forEach((node, i) => {
          gsap.from(node, {
            z: -150,
            rotateY: i % 2 === 0 ? 5 : -5,
            opacity: 0,
            x: i % 2 === 0 ? -30 : 30,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: node,
              start: "top 85%",
              once: true,
            },
          });
        });
      });

      /* ── Mobile: simple fade-up ──────────────────────────────────── */
      mm.add("(max-width: 1023px)", () => {
        const nodes = gsap.utils.toArray<HTMLElement>(
          "[data-achievement-node]",
        );
        nodes.forEach((node) => {
          gsap.from(node, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: node, start: "top 88%", once: true },
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="achievements"
      ref={sectionRef}
      className="relative py-24 md:py-36"
    >
      <div className="perspective-scene">
        <Container className="preserve-3d">
          <SectionHeader
            kicker="Recognition"
            title={<>Moments worth marking.</>}
          />

          {/* Timeline */}
          <div className="relative mt-10 preserve-3d pl-12 md:pl-16">
            <div ref={lineRef} className="timeline-connector-3d" />

            {recognition.map((a) => (
              <div
                key={a.title}
                data-achievement-node
                className="relative mb-12 preserve-3d pl-8 last:mb-0 md:pl-12"
                style={{ willChange: "transform, opacity" }}
              >
                <div className="timeline-dot-3d" />
                <div className="glass-3d rounded-2xl p-6 md:p-8">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-3xl leading-none text-ink/20 md:text-4xl">
                      {a.year}
                    </span>
                    <span className="text-sm text-accent">{a.place}</span>
                  </div>
                  <h3 className="mt-3 text-xl tracking-normal md:text-2xl md:tracking-tight">
                    {a.title}
                  </h3>
                  <p className="body-copy mt-3 max-w-lg text-[15px]">
                    {a.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recognition moments / photos */}
          <div className="moments mt-16">
            <h3 className="moments-title">Moments from the journey</h3>
            <Reveal className="moments-grid" stagger y={24}>
              {recognitionMoments.map((moment) => (
                <figure key={moment.src}>
                  <div className="img-wrap">
                    <picture>
                      <source srcSet={moment.webpSrc} type="image/webp" />
                      <img
                        src={moment.src}
                        alt={moment.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </div>
                  <figcaption>
                    <span className="moment-location">
                      <LocationPin />
                      {moment.location}
                    </span>
                    <span className="moment-caption-text">
                      {moment.caption}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        </Container>
      </div>
    </section>
  );
}
