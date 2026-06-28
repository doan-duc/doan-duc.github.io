"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site, navLinks } from "@/lib/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/utils";

export function Nav() {
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function go(id: string) {
    setOpen(false);
    scrollTo(`#${id}`);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          scrolled
            ? "border-b border-line bg-base/70 backdrop-blur-xl"
            : "border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
          {/* Wordmark */}
          <button
            onClick={() => scrollTo(0)}
            className="font-display text-lg tracking-tight text-ink"
            aria-label="Back to top"
          >
            {site.initials}
            <span className="text-accent">.</span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="group relative text-sm text-muted transition-colors hover:text-ink"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
            <Magnetic>
              <a
                href={`mailto:${site.email}`}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:bg-accent/10"
              >
                Get in touch
              </a>
            </Magnetic>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <div className="space-y-1.5">
              <span
                className={cn(
                  "block h-px w-6 bg-ink transition-transform duration-300",
                  open && "translate-y-[7px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-px w-6 bg-ink transition-opacity duration-300",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-px w-6 bg-ink transition-transform duration-300",
                  open && "-translate-y-[7px] -rotate-45"
                )}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col justify-center gap-2 bg-base/95 px-8 backdrop-blur-xl md:hidden"
          >
            {navLinks.map((l, i) => (
              <motion.button
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.1 }}
                onClick={() => go(l.id)}
                className="py-2 text-left font-display text-4xl tracking-display text-ink"
              >
                {l.label}
              </motion.button>
            ))}
            <a
              href={`mailto:${site.email}`}
              className="mt-6 text-sm text-muted"
            >
              {site.email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
