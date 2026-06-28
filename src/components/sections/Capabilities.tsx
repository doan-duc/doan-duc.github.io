import { capabilities } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";

export function Capabilities() {
  return (
    <section id="capabilities" className="relative py-24 md:py-36">
      <Container>
        <SectionHeader
          index="02 — Capabilities"
          kicker="What I work with"
          title={
            <>
              The <span className="text-gradient">stack</span> behind the work.
            </>
          }
        />

        {/* Editorial matrix (borders, not boxed cards) */}
        <Reveal stagger className="mt-6 grid md:grid-cols-2">
          {capabilities.map((c, i) => (
            <div
              key={c.title}
              className={[
                "border-b border-line py-10 md:py-12",
                // vertical divider between the two columns on desktop
                i % 2 === 0 ? "md:border-r md:pr-12" : "md:pl-12",
              ].join(" ")}
            >
              <h3 className="text-2xl tracking-tight md:text-3xl">{c.title}</h3>
              <p className="mt-3 text-sm text-muted">{c.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {c.skills.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
