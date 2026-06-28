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

        <Reveal delay={0.08} className="glass-panel grid content-between overflow-hidden p-6 md:p-8">
          <div>
            <p className="mb-3 text-sm font-bold text-[var(--gold)]">Research compass</p>
            <h3 className="max-w-sm text-2xl font-black leading-tight text-[var(--text)]">
              From noisy signals to systems that can be tested outside a notebook.
            </h3>
          </div>

          <div className="mt-10 grid gap-3">
            {["Sense", "Compress", "Deploy", "Learn"].map((step, index) => (
              <div
                key={step}
                className="grid grid-cols-[54px_minmax(0,1fr)] items-center gap-4 rounded-lg border border-[var(--line)] bg-[rgba(247,243,232,0.04)] p-4"
              >
                <span className="grid size-11 place-items-center rounded-lg border border-[rgba(70,199,216,0.28)] bg-[rgba(70,199,216,0.1)] text-sm font-black text-[var(--cyan)]">
                  0{index + 1}
                </span>
                <div>
                  <p className="text-base font-black text-[var(--text)]">{step}</p>
                  <p className="text-sm font-medium text-[var(--muted)]">
                    A design checkpoint before a model becomes a real embedded AI system.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
