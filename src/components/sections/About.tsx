import { about } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

export function About() {
  return (
    <section id="about" className="relative py-20 md:py-28">
      <Container>
        <div className="grid gap-10 border-y border-line py-12 md:grid-cols-12 md:gap-12 md:py-16">
          <div className="md:col-span-4">
            <Reveal>
              <span className="kicker">About</span>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            <Reveal>
              <p className="max-w-4xl text-balance text-3xl leading-[1.12] tracking-tight md:text-[3.1rem]">
                {about.lead}{" "}
                <span className="text-[var(--color-body)]">
                  {about.leadAccent}
                </span>
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid gap-10 border-b border-line py-10 md:grid-cols-12 md:gap-12 md:py-12">
          <div className="hidden md:col-span-4 md:block" aria-hidden="true" />

          <Reveal stagger className="grid gap-6 md:col-span-8 md:grid-cols-2">
            {about.body.map((p, i) => (
              <p key={i} className="body-copy">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
