"use client";

import { motion } from "framer-motion";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { awards } from "@/data/profile";

export function AwardsSection() {
  return (
    <section id="awards" className="section-wrap py-20 md:py-28">
      <SectionHeading
        eyebrow="Awards and achievements"
        title="Recognition with context, not trophy stacking."
        description="Awards are shown beside the environment that produced them, so each one supports the larger story."
      />

      <div className="relative">
        <div className="story-rail absolute bottom-6 left-5 top-6 hidden w-px md:block" />
        <div className="grid gap-5">
          {awards.map((award, index) => {
            const Icon = award.icon;

            return (
              <motion.article
                key={award.title}
                className="glass-panel grid gap-5 p-5 md:ml-14 md:grid-cols-[150px_minmax(0,1fr)_220px] md:items-center md:p-6"
                initial={{ opacity: 0, x: -26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: 0.68, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3 md:block">
                  <div className="grid size-12 place-items-center rounded-lg border border-[var(--line-strong)] bg-[rgba(231,188,92,0.12)] text-[var(--gold)]">
                    <Icon aria-hidden="true" size={22} />
                  </div>
                  <p className="text-2xl font-black text-[var(--text)] md:mt-4">{award.year}</p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-[var(--cyan)]">{award.place}</p>
                  <h3 className="text-xl font-black leading-tight text-[var(--text)]">
                    {award.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium text-[var(--text-soft)]">
                    {award.description}
                  </p>
                </div>

                {award.image ? (
                  <ImageFrame
                    image={award.image}
                    ratio="aspect-[4/3]"
                    className="border border-[var(--line)]"
                    sizes="(min-width: 768px) 220px, 100vw"
                  />
                ) : null}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
