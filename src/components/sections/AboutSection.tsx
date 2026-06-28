import { ImageFrame } from "@/components/ui/ImageFrame";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about, profile } from "@/data/profile";

export function AboutSection() {
  return (
    <section id="about" className="section-wrap py-20 md:py-28">
      <SectionHeading
        eyebrow="About me"
        title="I build from signals, constraints, and the people a system should serve."
        description="This is the thread behind the projects: not more AI for its own sake, but better intelligence where the signal is messy and the deployment context is real."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.72fr)] lg:items-stretch">
        <Reveal className="glass-panel p-6 md:p-8">
          <p className="text-lg font-semibold text-[var(--text-soft)] md:text-xl">{about.intro}</p>
          <p className="mt-6 text-base font-medium text-[var(--muted)] md:text-lg">{about.note}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {profile.focusAreas.map((area) => (
              <div
                key={area}
                className="rounded-lg border border-[var(--line)] bg-[rgba(247,243,232,0.045)] p-4"
              >
                <p className="text-sm font-black text-[var(--gold)]">{area}</p>
                <p className="mt-2 text-sm font-medium text-[var(--text-soft)]">
                  A direction where research quality and deployment discipline meet.
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <ImageFrame
            image={about.image}
            ratio="aspect-[4/5]"
            className="glass-panel h-full"
            sizes="(min-width: 1024px) 34vw, 100vw"
          >
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="rounded-lg border border-[var(--line)] bg-[rgba(7,9,15,0.82)] p-4 text-sm font-bold text-[var(--text-soft)] backdrop-blur-md">
                Presentation moments are used as evidence of research communication, not as a
                random gallery.
              </p>
            </div>
          </ImageFrame>
        </Reveal>
      </div>
    </section>
  );
}
