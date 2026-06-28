import { recognition } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";

export function Recognition() {
  return (
    <section id="recognition" className="relative py-24 md:py-36">
      <Container>
        <SectionHeader
          index="04 — Recognition"
          kicker="Signals"
          title={
            <>
              Selected <span className="text-gradient">recognition</span>.
            </>
          }
        />

        <Reveal stagger className="mt-8">
          {recognition.map((a) => (
            <div
              key={a.title}
              className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-6 md:py-9"
            >
              <div className="md:col-span-2">
                <span className="font-display text-3xl text-white/25 md:text-4xl">
                  {a.year}
                </span>
              </div>
              <div className="md:col-span-7">
                <h3 className="text-xl tracking-tight md:text-2xl">{a.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  {a.description}
                </p>
              </div>
              <div className="md:col-span-3 md:text-right">
                <span className="text-sm text-muted">{a.place}</span>
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
