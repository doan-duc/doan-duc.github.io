"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { highlights } from "@/data/profile";

export function HighlightsSection() {
  return (
    <section id="highlights" className="section-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="Featured highlights"
        title="Milestones that explain credibility, direction, and taste."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.article
              key={item.title}
              className="group glass-panel overflow-hidden p-5 md:p-6"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.22 }}
              transition={{ duration: 0.66, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -7 }}
            >
              <div className="mb-7 flex items-center justify-between gap-4">
                <span className="rounded-lg border border-[var(--line)] bg-[rgba(231,188,92,0.1)] px-3 py-2 text-xs font-black text-[var(--gold)]">
                  {item.eyebrow}
                </span>
                <Icon aria-hidden="true" className="text-[var(--cyan)]" size={24} />
              </div>
              <h3 className="text-xl font-black leading-tight text-[var(--text)]">{item.title}</h3>
              <p className="mt-3 text-sm font-medium text-[var(--text-soft)]">{item.description}</p>
              <div className="mt-7 h-px bg-[linear-gradient(90deg,var(--gold),var(--cyan),transparent)]" />
              <ArrowUpRight
                aria-hidden="true"
                className="mt-5 text-[var(--gold)] transition group-hover:translate-x-1 group-hover:-translate-y-1"
                size={20}
              />
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
