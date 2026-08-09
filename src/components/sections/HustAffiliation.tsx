import Image from "next/image";
import { site } from "@/lib/site";
import { ArrowUpRight } from "@/components/ui/icons";

type HustAffiliationProps = {
  animate?: boolean;
};

export function HustAffiliation({ animate = false }: HustAffiliationProps) {
  const affiliation = site.affiliation;

  return (
    <a
      data-hust-affiliation=""
      data-hero-stat={animate ? "" : undefined}
      href={affiliation.url}
      target="_blank"
      rel="noreferrer"
      className="hero-affiliation-card group"
    >
      <span className="hero-affiliation-logo" aria-hidden="true">
        <Image
          src={affiliation.logo.src}
          alt=""
          width={130}
          height={194}
          sizes="52px"
        />
      </span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-display text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">
            {affiliation.acronym}
          </span>
          <span className="hero-affiliation-badge">University</span>
        </span>
        <span className="mt-1 block text-sm leading-snug text-body">
          {affiliation.name}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-2 text-[0.72rem] font-medium text-muted">
          <span>{affiliation.degree}</span>
          <span aria-hidden="true" className="text-accent/70">
            •
          </span>
          <span>{affiliation.graduation}</span>
        </span>
      </span>

      <span className="hero-affiliation-arrow" aria-hidden="true">
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}
