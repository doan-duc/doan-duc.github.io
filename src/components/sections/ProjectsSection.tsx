"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/data/profile";
import type { Project } from "@/data/profile";

const storyLabels = [
  ["Problem", "problem"],
  ["What I built", "built"],
  ["What I learned", "learned"],
  ["Why it matters", "matters"]
] as const;

export function ProjectsSection() {
  return (
    <section id="projects" className="scroll-chapter section-wide py-20 md:py-28">
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
              "premium-card group glass-panel overflow-hidden",
              index === 0 && "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]"
            )}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -7 }}
          >
            <ProjectVisual visual={project.visual} featured={index === 0} />

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

function ProjectVisual({
  visual,
  featured = false
}: {
  visual: Project["visual"];
  featured?: boolean;
}) {
  return (
    <div
      className={clsx(
        "project-visual relative overflow-hidden border-b border-[var(--line)] bg-[rgba(7,9,15,0.55)] p-5",
        featured ? "min-h-[360px] lg:min-h-full lg:border-b-0 lg:border-r" : "min-h-[250px]"
      )}
      aria-label="Project system visual"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(70,199,216,0.08),transparent_42%,rgba(231,188,92,0.09))]" />
      {visual === "ecg" ? <EcgVisual /> : null}
      {visual === "streams" ? <StreamVisual /> : null}
      {visual === "qa" ? <QaVisual /> : null}
    </div>
  );
}

function EcgVisual() {
  return (
    <div className="relative z-10 grid h-full min-h-[220px] content-between">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-lg border border-[rgba(70,199,216,0.28)] bg-[rgba(70,199,216,0.1)] px-3 py-2 text-xs font-black text-[var(--cyan)]">
          EAR ECG
        </span>
        <span className="rounded-lg border border-[rgba(231,188,92,0.28)] bg-[rgba(231,188,92,0.1)] px-3 py-2 text-xs font-black text-[var(--gold)]">
          CHEST ECG
        </span>
      </div>
      <div className="my-8 rounded-lg border border-[rgba(70,199,216,0.2)] bg-[rgba(70,199,216,0.055)] p-4">
        <svg
          className="h-28 w-full overflow-visible"
          viewBox="0 0 420 112"
          role="img"
          aria-label="ECG reconstruction waveform"
        >
          <path
            d="M0 58 H42 L54 58 L64 26 L76 86 L90 58 H136 L150 58 L164 42 L178 72 L192 58 H248 L260 58 L272 18 L286 94 L302 58 H346 L362 58 L376 38 L392 74 L420 58"
            fill="none"
            stroke="#46c7d8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            className="ecg-line-main"
          />
          <path
            d="M0 70 H44 L56 70 L68 46 L82 92 L96 70 H140 L154 70 L168 56 L182 80 L198 70 H252 L264 70 L278 36 L292 100 L308 70 H350 L366 70 L380 54 L396 84 L420 70"
            fill="none"
            stroke="rgba(231,188,92,0.72)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            className="ecg-line-ghost"
          />
        </svg>
      </div>
      <div className="grid gap-5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid grid-cols-12 items-end gap-1.5">
            {[34, 42, 28, 72, 22, 52, 38, 86, 26, 48, 40, 62].map((height, index) => (
              <span
                key={`${row}-${index}`}
                className="rounded-sm bg-[linear-gradient(180deg,var(--cyan),rgba(70,199,216,0.08))]"
                style={{
                  height: `${Math.max(14, height - row * 9 + (index % 2) * 8)}px`,
                  opacity: 0.42 + row * 0.16
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs font-bold text-[var(--muted)]">
        compact reconstruction pipeline / quantized model / edge window
      </p>
    </div>
  );
}

function StreamVisual() {
  return (
    <div className="relative z-10 grid h-full min-h-[220px] content-between">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }, (_, index) => (
          <div
            key={index}
            className="stream-tile aspect-square rounded-lg border border-[rgba(126,207,143,0.24)] bg-[rgba(126,207,143,0.07)] p-2"
            style={{ transitionDelay: `${index * 14}ms` }}
          >
            <div className="mb-2 h-1.5 rounded-sm bg-[var(--green)] opacity-70" />
            <div className="h-8 rounded-md border border-[rgba(247,243,232,0.1)] bg-[rgba(247,243,232,0.04)]" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs font-black text-[var(--text-soft)]">
        <span>16 RTSP streams</span>
        <span className="text-[var(--green)]">Jetson Nano</span>
      </div>
    </div>
  );
}

function QaVisual() {
  return (
    <div className="relative z-10 grid h-full min-h-[220px] content-between">
      <div className="grid gap-4">
        {[0, 1].map((lane) => (
          <div
            key={lane}
            className="grid grid-cols-[70px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-[var(--line)] bg-[rgba(247,243,232,0.04)] p-3"
          >
            <span className="text-xs font-black text-[var(--gold)]">Tier {lane + 1}</span>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={clsx(
                    "qa-block h-10 rounded-md border",
                    index === 3 && lane === 1
                      ? "border-[rgba(236,119,99,0.5)] bg-[rgba(236,119,99,0.15)]"
                      : "border-[rgba(231,188,92,0.22)] bg-[rgba(231,188,92,0.1)]"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs font-bold text-[var(--muted)]">
        11 classes / multi-camera checklist / workflow-aware detection
      </p>
    </div>
  );
}
