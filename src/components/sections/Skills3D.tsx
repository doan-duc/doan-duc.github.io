"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { capabilities } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { Marquee } from "@/components/motion/Marquee";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Skills section: glass-3d panels at different Z-depths with parallax reveals.
 * No pinning — individual scroll-triggered entrances from depth.
 */
export function Skills3D() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ── Desktop: parallax depth reveals ──────────────────────────── */
      mm.add("(min-width: 1024px)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-skill-panel]");
        const depths = [-250, -350, -200, -400];

        panels.forEach((panel, i) => {
          gsap.from(panel, {
            z: depths[i % depths.length],
            opacity: 0,
            rotateY: i % 2 === 0 ? -4 : 4,
            scale: 0.94,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 88%",
              once: true,
            },
          });
        });
      });

      /* ── Mobile: simple fade-up reveals ──────────────────────────── */
      mm.add("(max-width: 1023px)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-skill-panel]");
        panels.forEach((panel) => {
          gsap.from(panel, {
            opacity: 0,
            y: 32,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: panel, start: "top 88%", once: true },
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-24 md:py-36"
    >
      <div className="perspective-scene">
        <Container className="preserve-3d">
          <SectionHeader
            index="02 — Skills"
            kicker="What I work with"
            title={<>The stack behind the work.</>}
          />

          <div className="mt-6 grid gap-4 preserve-3d md:grid-cols-2">
            {capabilities.map((c) => (
              <div
                key={c.title}
                data-skill-panel
                className="skill-panel-3d glass-3d rounded-2xl p-8 md:p-10"
              >
                <h3 className="text-2xl tracking-tight md:text-3xl">
                  {c.title}
                </h3>
                <p className="body-copy mt-3">{c.blurb}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {c.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <div className="mt-14">
        <Marquee />
      </div>
    </section>
  );
}
