"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { projects, type Project } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { ArrowUpRight } from "@/components/ui/icons";
import { TiltCard } from "@/components/motion/TiltCard";
import { ProjectVideoDemo } from "@/components/projects/ProjectVideoDemo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Phase block ─────────────────────────────────────────────────────── */
function Phase({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <div className="meta-label">{label}</div>
      <p className="body-copy mt-2">{children}</p>
    </div>
  );
}

/* ── Project card ────────────────────────────────────────────────────── */
function ProjectVisualSlot({ project }: { project: Project }) {
  if (project.demo) {
    return <ProjectVideoDemo demo={project.demo} />;
  }

  return (
    <div
      className="project-visual-slot mt-7"
      aria-label={project.visualHint}
      role="img"
    >
      <span className="sr-only">{project.visualHint}</span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <TiltCard max={8.5} hoverScale={1.014} glare className="[transform-style:preserve-3d]">
      <div className="glass-3d relative z-[1] rounded-3xl p-7 md:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Identity */}
          <div className="lg:col-span-4">
            <div className="num-gradient-solid font-display text-6xl leading-none opacity-25">
              {project.index}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm font-medium text-accent/90">
                {project.eyebrow}
              </span>
              <span className="text-xs text-muted/60">{project.year}</span>
            </div>
            <h3 className="mt-3 text-2xl tracking-normal md:text-[2rem] md:leading-[1.05] md:tracking-tight">
              {project.title}
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <ProjectVisualSlot project={project} />
            {project.link && (
              <a
                href={project.link.href}
                target="_blank"
                rel="noreferrer"
                className="group mt-7 inline-flex items-center gap-1.5 text-sm text-ink transition-colors hover:text-accent"
              >
                {project.link.label}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>

          {/* Phases */}
          <div className="grid gap-7 sm:grid-cols-2 lg:col-span-8">
            <Phase label="Problem">{project.problem}</Phase>
            <Phase label="What I built">{project.built}</Phase>
            <Phase label="What I learned">{project.learned}</Phase>
            <Phase label="Why it matters">{project.matters}</Phase>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

/* Projects3D: individual 3D reveals, no pin. */
export function Projects3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-project-card]", { clearProps: "all" });
      });

      /* ── Desktop: individual 3D depth reveals ────────────────────── */
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          stackRef.current!.querySelectorAll("[data-project-card]"),
        );
        cards.forEach((card, i) => {
          gsap.from(card, {
            z: -300,
            rotateX: 4,
            rotateY: i % 2 === 0 ? -3 : 3,
            opacity: 0,
            y: 60,
            scale: 0.95,
            duration: 1.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          });
        });
      });

      /* ── Mobile: full depth reveals on outer wrappers ───────────── */
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          stackRef.current!.querySelectorAll("[data-project-card]"),
        );
        cards.forEach((card, i) => {
          gsap.from(card, {
            z: -220,
            rotateX: 6,
            rotateY: i % 2 === 0 ? -0.5 : 0.5,
            opacity: 0,
            y: 58,
            scale: 0.94,
            force3D: true,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
            onComplete: () => {
              gsap.set(card, { clearProps: "transform,opacity" });
            },
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 md:py-32"
    >
      <div className="perspective-scene">
        <Container className="preserve-3d">
          <SectionHeader
            kicker="Selected work"
            title={<>Things I&apos;ve shipped.</>}
          />
          <div
            ref={stackRef}
            className="mt-14 space-y-8 preserve-3d"
          >
            {projects.map((p) => (
              <div
                key={p.index}
                data-project-card
                className="project-card-3d"
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
