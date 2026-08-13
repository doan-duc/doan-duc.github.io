"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { site, navLinks } from "@/lib/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/utils";
import { observeMediaQuery } from "@/lib/media-query";

/** Sliding-pill spring: a fast glide with a whisper of overshoot. */
const pillSpring = { type: "spring", stiffness: 380, damping: 34 } as const;

export function Nav() {
  const { scrollTo } = useSmoothScroll();
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreToggleFocusRef = useRef(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // Scroll-spy: highlight the active section in the nav.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    navLinks.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = () => {
      if (!desktop.matches) return;
      restoreToggleFocusRef.current = false;
      setOpen(false);
    };

    closeAtDesktop();
    return observeMediaQuery(desktop, closeAtDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";

    const focusable = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? [],
      );
    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>("[data-menu-action]")?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        restoreToggleFocusRef.current = true;
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const controls = focusable();
      if (controls.length === 0) return;
      const currentIndex = controls.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? controls.length - 1
          : currentIndex - 1
        : currentIndex < 0 || currentIndex === controls.length - 1
          ? 0
          : currentIndex + 1;
      event.preventDefault();
      controls[nextIndex]?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflowY = previousOverflowY;
      if (restoreToggleFocusRef.current) {
        window.requestAnimationFrame(() => toggleRef.current?.focus());
        restoreToggleFocusRef.current = false;
      }
    };
  }, [open]);

  function go(id: string) {
    restoreToggleFocusRef.current = false;
    setOpen(false);
    scrollTo(`#${id}`);
  }

  return (
    <>
      <header
        data-scrolled={scrolled || undefined}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* Frosted glass, exactly nav-sized. The filter stays constant and only
            this layer's OPACITY crossfades on scroll — transitioning
            backdrop-filter itself re-rasterises every frame. */}
        <span aria-hidden="true" className="nav-glass" />
        <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
          <button
            onClick={() => scrollTo(0)}
            className="inline-flex min-h-11 min-w-11 items-center font-display text-lg tracking-tight text-ink"
            aria-label="Back to top"
          >
            {site.initials}
            <span className="text-accent">.</span>
          </button>

          <div data-desktop-nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-full px-3 text-sm transition-colors",
                  active === l.id
                    ? "text-accent"
                    : "text-muted hover:bg-white/[0.03] hover:text-ink"
                )}
              >
                {active === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    transition={shouldReduceMotion ? { duration: 0 } : pillSpring}
                  />
                )}
                {l.label}
              </button>
            ))}
            <Magnetic>
              <a
                href={`mailto:${site.email}`}
                className="ml-3 inline-flex min-h-11 items-center rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:bg-accent/10"
              >
                Get in touch
              </a>
            </Magnetic>
          </div>

          <button
            ref={toggleRef}
            onClick={() => {
              restoreToggleFocusRef.current = open;
              setOpen((value) => !value);
            }}
            className="flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <div className="space-y-1.5">
              <span className={cn("block h-px w-6 bg-ink transition-transform duration-300", open && "translate-y-[7px] rotate-45")} />
              <span className={cn("block h-px w-6 bg-ink transition-opacity duration-300", open && "opacity-0")} />
              <span className={cn("block h-px w-6 bg-ink transition-transform duration-300", open && "-translate-y-[7px] -rotate-45")} />
            </div>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="nav-overlay-glass fixed inset-0 z-[60] flex flex-col justify-start gap-2 overflow-y-auto px-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,env(safe-area-inset-top))] lg:hidden"
          >
            <button
              type="button"
              onClick={() => {
                restoreToggleFocusRef.current = true;
                setOpen(false);
              }}
              aria-label="Close navigation"
              className="absolute right-[max(1.25rem,env(safe-area-inset-right))] top-[max(0.625rem,env(safe-area-inset-top))] inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-2xl leading-none text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            {navLinks.map((l, i) => (
              <motion.button
                key={l.id}
                data-menu-action
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.05 * i + 0.1 }}
                onClick={() => go(l.id)}
                className="min-h-11 py-2 text-left font-display text-4xl tracking-display text-ink"
              >
                {l.label}
              </motion.button>
            ))}
            <a
              href={`mailto:${site.email}`}
              aria-label={`Email ${site.name}`}
              className="mt-6 inline-flex min-h-11 items-center text-sm text-muted"
            >
              {site.email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
