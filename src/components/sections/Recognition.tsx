import Image from "next/image";
import { recognition, type AwardImage } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { cn } from "@/lib/utils";

/* Scene-photo treatment ONLY (never the About portrait): light desaturation +
   slight contrast, thin border, minimal rounding, gentle zoom on hover. */
function ScenePhoto({
  image,
  className,
  frameClassName,
  sizes,
}: {
  image: AwardImage;
  className?: string;
  frameClassName: string;
  sizes: string;
}) {
  return (
    <figure className={cn("group/photo", className)}>
      <div className={cn("relative overflow-hidden rounded-md border border-line", frameClassName)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover brightness-[0.96] contrast-[1.06] saturate-[0.82] transition-transform duration-700 ease-out group-hover/photo:scale-[1.04]"
        />
      </div>
      <figcaption className="mt-[10px] block max-w-full text-left text-[14px] tracking-[0.01em] text-muted">
        {image.caption}
      </figcaption>
    </figure>
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
              className="grid items-center gap-8 border-t border-line py-12 md:grid-cols-12 md:gap-12 md:py-16"
            >
              {/* Text block — parallax slower than the image */}
              <Parallax amount={12} className="md:col-span-5">
                <span className="block font-display text-5xl leading-none text-ink/15 md:text-6xl">
                  {a.year}
                </span>
                <h3 className="mt-5 text-2xl tracking-tight md:text-3xl">
                  {a.title}
                </h3>
                <div className="mt-2 text-sm text-accent">{a.place}</div>
                <p className="body-copy mt-4 max-w-md">
                  {a.description}
                </p>
              </Parallax>

              {/* Image block — parallax faster (moves more) than the text */}
              {a.images.length > 0 && (
                <Parallax amount={44} className="md:col-span-7">
                  {a.images.length === 1 ? (
                    // Single scene photo
                    <ScenePhoto
                      image={a.images[0]}
                      frameClassName="aspect-[16/10]"
                      sizes="(max-width: 768px) 90vw, 600px"
                    />
                  ) : (
                    // Two-photo cluster (UTokyo / Japan story)
                    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.42fr)] sm:items-end">
                      <ScenePhoto
                        image={a.images[0]}
                        frameClassName="aspect-[16/10]"
                        sizes="(max-width: 768px) 90vw, 560px"
                      />
                      <ScenePhoto
                        image={a.images[1]}
                        className="sm:translate-y-8"
                        frameClassName="aspect-[4/3]"
                        sizes="(max-width: 768px) 90vw, 240px"
                      />
                    </div>
                  )}
                </Parallax>
              )}
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
