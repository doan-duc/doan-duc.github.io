"use client";

import { motion } from "framer-motion";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ArrowDown } from "@/components/ui/icons";
import { Magnetic } from "@/components/motion/Magnetic";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

// Staggered fade + slide-up on load (Framer Motion variants).
const group = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Hero() {
  const { scrollTo } = useSmoothScroll();

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end pb-20 pt-28">
      <Container>
        <motion.div variants={group} initial="hidden" animate="show">
          {/* Availability + location */}
          <motion.p
            variants={item}
            className="kicker flex items-center gap-2.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {site.available} · {site.location}
          </motion.p>

          {/* Giant name — the hero statement */}
          <h1 className="mt-7 text-[clamp(3rem,12vw,11rem)] font-semibold leading-[0.88] tracking-display">
            <motion.span variants={item} className="block">
              Duc Doan
            </motion.span>
            <motion.span variants={item} className="block">
              <span className="text-gradient">Sinh.</span>
            </motion.span>
          </h1>

          {/* Supporting statement */}
          <motion.p
            variants={item}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          >
            {site.summary}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
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
          </motion.div>

          {/* Proof chips */}
          <motion.div
            variants={item}
            className="mt-16 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line sm:grid-cols-3"
          >
            {site.heroStats.map((s) => (
              <div key={s.label} className="bg-white/[0.02] px-5 py-4">
                <div className="font-display text-xl text-ink">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted md:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </motion.div>
    </section>
  );
}
