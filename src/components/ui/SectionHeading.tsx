import { Reveal } from "@/components/ui/Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionHeadingProps) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mx-auto mb-10 max-w-3xl text-center md:mb-14"
          : "mb-10 max-w-4xl md:mb-14"
      }
    >
      <p className="mb-3 text-sm font-semibold text-[var(--gold)]">{eyebrow}</p>
      <h2 className="text-display text-4xl leading-[1.05] text-balance text-[var(--text)] md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-base font-medium text-[var(--text-soft)] md:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
