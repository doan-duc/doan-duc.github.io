"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { profile } from "@/data/profile";

const navItems = [
  { label: "Story", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Awards", href: "#awards" },
  { label: "Journey", href: "#experience" },
  { label: "Contact", href: "#contact" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-[linear-gradient(90deg,var(--gold),var(--cyan),var(--green),var(--coral))]"
        style={{ scaleX }}
        aria-hidden="true"
      />
      <header className="fixed left-3 right-3 top-4 z-40 mx-auto max-w-[1180px] rounded-lg border border-[var(--line)] bg-[rgba(7,9,15,0.78)] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <a
            href="#home"
            className="grid size-11 place-items-center rounded-lg border border-[var(--line-strong)] bg-[linear-gradient(135deg,var(--gold),var(--cyan))] text-sm font-black text-[var(--ink)] transition duration-200 hover:-translate-y-1"
            aria-label={`${profile.name} home`}
          >
            {profile.initials}
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-bold text-[var(--text-soft)] transition duration-200 hover:bg-[rgba(231,188,92,0.1)] hover:text-[var(--gold)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg border border-[var(--line)] bg-[rgba(247,243,232,0.06)] text-[var(--text)] md:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        {open ? (
          <motion.nav
            className="mt-2 grid gap-1 rounded-lg border border-[var(--line)] bg-[rgba(17,23,31,0.96)] p-2 md:hidden"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-bold text-[var(--text-soft)] transition hover:bg-[rgba(231,188,92,0.1)] hover:text-[var(--gold)]"
              >
                {item.label}
              </a>
            ))}
          </motion.nav>
        ) : null}
      </header>
    </>
  );
}
