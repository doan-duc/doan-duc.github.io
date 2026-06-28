"use client";

import { motion } from "framer-motion";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { photoJourney } from "@/data/profile";

export function PhotoJourneySection() {
  return (
    <section id="journey" className="section-wrap py-20 md:py-28">
      <SectionHeading
        eyebrow="Photo journey"
        title="A curated visual timeline with a reason for every image."
        description="Each photo is attached to a stage in the story: entering a research environment, presenting work, learning through community, and testing impact."
      />

      <div className="grid gap-6">
        {photoJourney.map((item, index) => (
          <motion.article
            key={item.title}
            className="grid gap-5 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.05fr)] md:items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.72, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="glass-panel p-5 md:p-6">
              <p className="mb-5 inline-flex size-12 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(231,188,92,0.12)] text-sm font-black text-[var(--gold)]">
                {item.chapter}
              </p>
              <h3 className="text-2xl font-black leading-tight text-[var(--text)]">{item.title}</h3>
              <p className="mt-4 text-sm font-medium text-[var(--text-soft)]">{item.caption}</p>
            </div>

            <ImageFrame
              image={item.image}
              ratio="aspect-[16/10]"
              className="glass-panel"
              sizes="(min-width: 768px) 58vw, 100vw"
            />
          </motion.article>
        ))}
      </div>
    </section>
  );
}
