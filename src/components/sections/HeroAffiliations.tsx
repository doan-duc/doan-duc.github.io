import Image from "next/image";
import { site } from "@/lib/site";
import { ArrowUpRight } from "@/components/ui/icons";
import { TiltCard } from "@/components/motion/TiltCard";

type HeroAffiliationsProps = {
  animate?: boolean;
};

const affiliationSpring = {
  stiffness: 320,
  damping: 21,
  mass: 0.28,
};

export function HeroAffiliations({ animate = false }: HeroAffiliationsProps) {
  return (
    <aside
      data-hero-affiliations=""
      data-affiliation-motion="spring-3d"
      data-hero-stat={animate ? "" : undefined}
      aria-label="Academic and research affiliations"
      className="hero-affiliations"
    >
      {site.affiliations.map((affiliation) => (
        <a
          key={affiliation.id}
          data-hust-affiliation={affiliation.id === "hust" ? "" : undefined}
          data-edabk-affiliation={
            affiliation.id === "edabk" ? "" : undefined
          }
          href={affiliation.url}
          target="_blank"
          rel="noreferrer"
          className={`hero-affiliation-card hero-affiliation-card--${affiliation.id} group`}
        >
          <div
            data-affiliation-surface=""
            className="hero-affiliation-surface"
          >
            <TiltCard
              max={6}
              hoverScale={1.012}
              spring={affiliationSpring}
              glare
              className="hero-affiliation-surface-motion"
            >
              <span
                className={`hero-affiliation-logo hero-affiliation-logo--${affiliation.id}`}
                aria-hidden="true"
              >
                <Image
                  src={affiliation.logo.src}
                  alt=""
                  width={affiliation.logo.width}
                  height={affiliation.logo.height}
                  sizes={affiliation.logo.sizes}
                />
              </span>

              <span className="hero-affiliation-copy">
                <span className="hero-affiliation-heading">
                  <span className="hero-affiliation-acronym">
                    {affiliation.acronym}
                  </span>
                  <span className="hero-affiliation-badge">
                    {affiliation.kind}
                  </span>
                </span>
                <span className="hero-affiliation-name">{affiliation.name}</span>
                <span className="hero-affiliation-meta">
                  <span>{affiliation.detail}</span>
                  <span
                    aria-hidden="true"
                    className="hero-affiliation-separator"
                  >
                    ·
                  </span>
                  <span>{affiliation.meta}</span>
                </span>
              </span>

              <span className="hero-affiliation-arrow" aria-hidden="true">
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </TiltCard>
          </div>
        </a>
      ))}
    </aside>
  );
}
