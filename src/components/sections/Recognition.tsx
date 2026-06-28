import Image from "next/image";
import { recognition, recognitionMoments } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";

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
    >
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

export function Recognition() {
  return (
    <section id="recognition" className="relative py-24 md:py-36">
      <Container>
        <SectionHeader
          index="04 — Recognition"
          kicker="Signals"
          title={<>Moments worth marking.</>}
        />

        <div className="mt-10">
          {recognition.map((a) => (
            <Reveal
              key={a.title}
              className="grid gap-5 border-t border-line py-10 md:grid-cols-[150px_minmax(0,1fr)] md:gap-12 md:py-12"
            >
              <span className="block font-display text-5xl leading-none text-ink/15 md:text-6xl">
                {a.year}
              </span>
              <div>
                <h3 className="text-2xl tracking-tight md:text-3xl">
                  {a.title}
                </h3>
                <div className="mt-2 text-sm text-accent">{a.place}</div>
                <p className="body-copy mt-4 max-w-md">
                  {a.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="moments">
          <h3 className="moments-title">Moments from the journey</h3>
          <Reveal className="moments-grid" stagger y={24}>
            {recognitionMoments.map((moment) => (
              <figure key={moment.src}>
                <div className="img-wrap">
                  <Image
                    src={moment.src}
                    alt={moment.alt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 768px) calc(100vw - 40px), 50vw"
                  />
                </div>
                <figcaption>
                  <span className="moment-location">
                    <LocationPin />
                    {moment.location}
                  </span>
                  <span className="moment-caption-text">{moment.caption}</span>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
