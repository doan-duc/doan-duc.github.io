import { projects, type Project } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { Tag } from "@/components/ui/Tag";
import { ArrowUpRight } from "@/components/ui/icons";

function Phase({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <div className="meta-label">
        {label}
      </div>
      <p className="body-copy mt-2">{children}</p>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <TiltCard max={5} className="[transform-style:preserve-3d]">
      {/* Faint accent border glow on hover (solid, never a gradient border) */}
      <div className="glass rounded-3xl p-7 transition-[border-color,box-shadow] duration-500 hover:border-accent/30 hover:shadow-[0_0_60px_-16px_rgba(34,211,238,0.35)] md:p-12">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <div className="num-gradient-solid font-display text-6xl leading-none opacity-25">
              {project.index}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="kicker">{project.eyebrow}</span>
              <span className="text-xs text-muted/60">{project.year}</span>
            </div>
            <h3 className="mt-3 text-2xl tracking-tight md:text-[2rem] md:leading-[1.05]">
              {project.title}
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
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

          {/* Problem → Built → Learned → Why */}
          <div className="grid gap-7 sm:grid-cols-2 md:col-span-8">
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

export function Work() {
  return (
    <section id="work" className="relative py-24 md:py-36">
      <Container>
        <SectionHeader
          index="01 — Work"
          kicker="Selected work"
          title={<>Things I&apos;ve shipped.</>}
        />
        <div className="mt-14 space-y-8 md:space-y-10">
          {projects.map((p) => (
            <Reveal key={p.index} y={48}>
              <ProjectRow project={p} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
