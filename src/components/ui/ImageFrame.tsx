import clsx from "clsx";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import type { Visual } from "@/data/profile";

type ImageFrameProps = PropsWithChildren<{
  image: Visual;
  ratio?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}>;

export function ImageFrame({
  image,
  ratio = "aspect-[4/5]",
  className,
  imageClassName,
  priority = false,
  sizes = "(min-width: 1024px) 42vw, 100vw",
  children
}: ImageFrameProps) {
  return (
    <div className={clsx("group/image relative overflow-hidden rounded-lg", className)}>
      <div className={clsx("image-sheen relative overflow-hidden", ratio)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes={sizes}
          className={clsx(
            "object-cover transition duration-700 ease-out group-hover/image:scale-[1.045]",
            imageClassName
          )}
        />
        <div className="media-overlay" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
