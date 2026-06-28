"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { currentWork } from "@/data/profile";

export function NowSection() {
  return (
    <section id="now" className="section-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="Now and next"
        title="Current work that points toward the next version of the profile."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentWork.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.article
              key={item.title}
              className="glass-panel p-5 md:p-6"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.24 }}
              transition={{ duration: 0.66, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              <div className="mb-7 flex items-center justify-between gap-4">
                <p className="rounded-lg border border-[var(--line)] bg-[rgba(70,199,216,0.1)] px-3 py-2 text-xs font-black text-[var(--cyan)]">
                  {item.year}
                </p>
                <Icon aria-hidden="true" className="text-[var(--green)]" size={24} />
              </div>
              <p className="mb-2 text-sm font-bold text-[var(--gold)]">{item.place}</p>
              <h3 className="text-lg font-black leading-tight text-[var(--text)]">{item.title}</h3>
              <p className="mt-3 text-sm font-medium text-[var(--text-soft)]">
                {item.description}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
