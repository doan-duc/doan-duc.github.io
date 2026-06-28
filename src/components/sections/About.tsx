import Image from "next/image";
import { about } from "@/lib/content";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-36">
      <Container className="grid gap-14 md:grid-cols-12 md:gap-10">
        {/* Manifesto */}
        <div className="md:col-span-7">
          <Reveal>
            <span className="kicker">About</span>
          </Reveal>
          <Reveal>
            <p className="mt-8 text-balance text-3xl leading-[1.15] tracking-tight md:text-[2.8rem]">
              {about.lead} <span className="text-muted">{about.leadAccent}</span>
            </p>
          </Reveal>
        </div>

        {/* Portrait + body */}
        <div className="md:col-span-5">
          <Reveal>
            {/* 👉 Portrait swap: /public/images/profile.jpg — kept in FULL COLOR
                on purpose (the one human anchor). Edges dissolve into #0a0a0a. */}
            <div className="group relative w-full max-w-sm">
              {/* Soft cyan glow behind the frame */}
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[2rem]"
                style={{
                  background:
                    "radial-gradient(circle at 50% 38%, rgba(34,211,238,0.22), transparent 70%)",
                  filter: "blur(34px)",
                }}
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
                <Image
                  src={site.portrait.src}
                  alt={site.portrait.alt}
                  fill
                  sizes="(max-width: 768px) 80vw, 380px"
                  className="object-cover brightness-[0.92] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {/* "Emerge from black": a tight spotlight vignette keeps the face
                    lit while the LIGHT studio backdrop falls off into #0a0a0a, so
                    the portrait reads as intentional instead of a floating box. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, #0a0a0a 0%, rgba(10,10,10,0) 16%, rgba(10,10,10,0) 78%, #0a0a0a 100%), radial-gradient(78% 82% at 50% 34%, transparent 0%, transparent 22%, rgba(10,10,10,0.5) 47%, rgba(10,10,10,0.9) 72%, #0a0a0a 90%)",
                  }}
                />
              </div>
            </div>
          </Reveal>

          <Reveal stagger className="mt-8 space-y-5 text-muted">
            {about.body.map((p, i) => (
              <p key={i} className="leading-relaxed">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
