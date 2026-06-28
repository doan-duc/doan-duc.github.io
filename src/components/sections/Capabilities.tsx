import { capabilities } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";
import { Marquee } from "@/components/motion/Marquee";

export function Capabilities() {
  return (
    <section id="capabilities" className="relative py-24 md:py-36">
      <Container>
        <SectionHeader
          index="02 — Capabilities"
          kicker="What I work with"
          title={<>The stack behind the work.</>}
        />

        <Reveal stagger className="mt-6 grid md:grid-cols-2">
          {capabilities.map((c, i) => (
            <div
              key={c.title}
              className={[
                "border-b border-line py-10 md:py-12",
                i % 2 === 0 ? "md:border-r md:pr-12" : "md:pl-12",
              ].join(" ")}
            >
              <h3 className="text-2xl tracking-tight md:text-3xl">{c.title}</h3>
              <p className="body-copy mt-3">{c.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {c.skills.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </Container>

      {/* One slow infinite marquee of skill pills */}
      <div className="mt-14">
        <Marquee />
      </div>
    </section>
  );
}
