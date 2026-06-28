"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experiences } from "@/data/profile";

export function ExperiencesSection() {
  return (
    <section id="experience" className="section-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="Experiences and journey"
        title="Places where the direction became more concrete."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {experiences.map((experience, index) => (
          <motion.article
            key={experience.title}
            className="group glass-panel overflow-hidden"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.68, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -7 }}
          >
            <ImageFrame
              image={experience.image}
              ratio="aspect-[16/10]"
              className="rounded-none"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="p-5 md:p-6">
              <div className="mb-4 flex flex-wrap gap-3 text-xs font-bold text-[var(--muted)]">
                <span className="inline-flex items-center gap-2">
                  <Calendar aria-hidden="true" size={15} />
                  {experience.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" size={15} />
                  {experience.place}
                </span>
              </div>
              <h3 className="text-xl font-black leading-tight text-[var(--text)]">
                {experience.title}
              </h3>
              <p className="mt-3 text-sm font-medium text-[var(--text-soft)]">
                {experience.story}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
