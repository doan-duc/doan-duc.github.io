"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ArrowDown } from "@/components/ui/icons";
import { Magnetic } from "@/components/motion/Magnetic";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export function Hero() {
  const { scrollTo } = useSmoothScroll();
  const root = useRef<HTMLElement>(null);
  const kicker = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const rest = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Split the heading into lines, each wrapped in an overflow-hidden mask.
      const split = new SplitText(heading.current, {
        type: "lines",
        mask: "lines",
      });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(kicker.current, { y: 18, opacity: 0, duration: 0.7 })
        .from(
          split.lines,
          {
            yPercent: 110,
            filter: "blur(8px)",
            opacity: 0,
            duration: 1.1,
            stagger: 0.08,
          },
          "-=0.3"
        )
        .from(
          rest.current ? Array.from(rest.current.children) : [],
          { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 },
          "-=0.55"
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-end pb-20 pt-28"
    >
      {/* Soft, slowly-pulsing cyan glow behind the name */}
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute bottom-[18%] left-[2%] -z-0 h-[42vw] max-h-[640px] w-[42vw] max-w-[640px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.5) 0%, rgba(34,211,238,0.12) 35%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      <Container className="relative z-10">
        <p ref={kicker} className="kicker flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {site.available} · {site.location}
        </p>

        {/* Giant name — full white, no gradient. Glow lives behind it. */}
        <h1
          ref={heading}
          className="mt-7 text-[clamp(3rem,12vw,11rem)] font-semibold leading-[0.88] tracking-display"
        >
          <span className="block">Duc Doan</span>
          <span className="block">Sinh.</span>
        </h1>

        <div ref={rest}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            {site.summary}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button
                onClick={() => scrollTo("#work")}
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-transform hover:scale-[1.02]"
              >
                Selected work
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </button>
            </Magnetic>
            <a
              href={`mailto:${site.email}`}
              className="rounded-full border border-line px-6 py-3 text-sm text-ink transition-colors hover:border-accent hover:bg-accent/10"
            >
              Get in touch
            </a>
          </div>

          <div className="mt-16 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line sm:grid-cols-3">
            {site.heroStats.map((s) => (
              <div key={s.label} className="bg-white/[0.02] px-5 py-4">
                <div className="font-display text-xl text-ink">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted md:flex">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
