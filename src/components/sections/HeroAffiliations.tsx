import Image from "next/image";
import { site } from "@/lib/site";
import { ArrowUpRight } from "@/components/ui/icons";

type HeroAffiliationsProps = {
  animate?: boolean;
};

export function HeroAffiliations({ animate = false }: HeroAffiliationsProps) {
  return (
    <aside
      data-hero-affiliations=""
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
              <span aria-hidden="true" className="hero-affiliation-separator">
                ·
              </span>
              <span>{affiliation.meta}</span>
            </span>
          </span>

          <span className="hero-affiliation-arrow" aria-hidden="true">
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>
      ))}
    </aside>
  );
}
