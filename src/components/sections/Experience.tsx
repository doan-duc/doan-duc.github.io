import { experience } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";

export function Experience() {
  return (
    <section id="experience" className="relative py-24 md:py-36">
      <Container>
        <SectionHeader
          index="03 — Now"
          kicker="Where I am"
          title={<>What I&apos;m building now.</>}
        />

        <Reveal stagger className="mt-8">
          {experience.map((e) => (
            <div
              key={e.role}
              className="group grid gap-3 border-b border-line py-8 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:gap-6 md:py-10"
            >
              <div className="md:col-span-3">
                <span className="kicker">{e.period}</span>
              </div>
              <div className="md:col-span-9">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-xl tracking-tight md:text-2xl">{e.role}</h3>
                  <span className="text-sm text-accent">{e.org}</span>
                  <span className="text-xs text-muted/70">· {e.place}</span>
                </div>
                <p className="mt-3 max-w-2xl text-muted">{e.body}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
