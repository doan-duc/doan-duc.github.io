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
              {about.lead}{" "}
              <span className="text-muted">{about.leadAccent}</span>
            </p>
          </Reveal>
        </div>

        {/* Portrait + body */}
        <div className="md:col-span-5">
          <Reveal>
            {/* 👉 Swap portrait at /public/images/profile.jpg */}
            <div className="group relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-line">
              <img
                src={site.portrait.src}
                alt={site.portrait.alt}
                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-base/60 to-transparent" />
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
