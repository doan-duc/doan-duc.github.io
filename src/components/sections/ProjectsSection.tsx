"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/data/profile";

const storyLabels = [
  ["Problem", "problem"],
  ["What I built", "built"],
  ["What I learned", "learned"],
  ["Why it matters", "matters"]
] as const;

export function ProjectsSection() {
  return (
    <section id="projects" className="section-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="Projects and research"
        title="Selected work presented as engineering stories, not resume rows."
        description="Each project is framed around the constraint that shaped it: noisy data, limited hardware, workflow state, or human impact."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {projects.map((project, index) => (
          <motion.article
            key={project.title}
            className={clsx(
              "group glass-panel overflow-hidden",
              index === 0 && "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]"
            )}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -7 }}
          >
            <ImageFrame
              image={project.image}
              ratio={index === 0 ? "aspect-[4/5] lg:h-full lg:aspect-auto" : "aspect-[4/3]"}
              className="rounded-none"
              sizes={index === 0 ? "(min-width: 1024px) 38vw, 100vw" : "(min-width: 1024px) 28vw, 100vw"}
            />

            <div className="p-5 md:p-6">
              <p className="mb-3 text-sm font-bold text-[var(--gold)]">{project.eyebrow}</p>
              <h3 className="text-2xl font-black leading-tight text-[var(--text)]">
                {project.title}
              </h3>

              <div className="mt-5 grid gap-4">
                {storyLabels.map(([label, key]) => (
                  <div key={label} className="border-t border-[var(--line)] pt-4">
                    <p className="mb-1 text-xs font-black text-[var(--cyan)]">{label}</p>
                    <p className="text-sm font-medium text-[var(--text-soft)]">{project[key]}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[var(--line)] bg-[rgba(247,243,232,0.045)] px-3 py-1.5 text-xs font-bold text-[var(--text-soft)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.link ? (
                <a
                  href={project.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--gold)] transition hover:translate-x-1"
                >
                  {project.link.label}
                  <ExternalLink aria-hidden="true" size={16} />
                </a>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
