"use client";

import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { ArrowUpRight, Github, Linkedin, Mail } from "@/components/ui/icons";

export function Contact() {
  return (
    <section id="contact" className="relative py-28 md:py-44">
      <Container>
        <Reveal>
          <span className="kicker">Contact</span>
        </Reveal>

        <Reveal>
          <h2 className="mt-7 text-[clamp(2.75rem,9vw,8rem)] leading-[0.9] tracking-display">
            Let&apos;s build
            <br />
            something useful.
          </h2>
        </Reveal>

        <Reveal className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic>
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-[#0a0a0a] transition-transform hover:scale-[1.02]"
            >
              {site.email}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Magnetic>
          <a
            href={site.cv}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line px-7 py-3.5 text-sm text-ink transition-colors hover:border-accent hover:bg-accent/10"
          >
            Download CV
          </a>
        </Reveal>

        <Reveal stagger className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line sm:grid-cols-3">
          <a href={site.github} target="_blank" rel="noreferrer" className="group flex items-center justify-between bg-white/[0.02] px-6 py-5 transition-colors hover:bg-white/[0.04]">
            <span className="flex items-center gap-3 text-ink"><Github className="h-5 w-5" /> GitHub</span>
            <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer" className="group flex items-center justify-between bg-white/[0.02] px-6 py-5 transition-colors hover:bg-white/[0.04]">
            <span className="flex items-center gap-3 text-ink"><Linkedin className="h-5 w-5" /> LinkedIn</span>
            <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a href={`mailto:${site.universityEmail}`} className="group flex items-center justify-between bg-white/[0.02] px-6 py-5 transition-colors hover:bg-white/[0.04]">
            <span className="flex items-center gap-3 text-ink"><Mail className="h-5 w-5" /> University</span>
            <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
