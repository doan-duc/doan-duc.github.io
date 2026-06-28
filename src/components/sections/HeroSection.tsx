"use client";

import { motion } from "framer-motion";
import { BriefcaseBusiness, Code2, Download, Mail, MoveRight } from "lucide-react";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { LinkButton } from "@/components/ui/LinkButton";
import { profile } from "@/data/profile";

export function HeroSection() {
  return (
    <section
      id="home"
      className="section-wide grid min-h-screen grid-cols-1 items-center gap-10 pb-16 pt-32 md:pt-36 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.72fr)] lg:gap-14"
    >
      <div className="max-w-4xl">
        <motion.p
          className="mb-4 text-sm font-semibold text-[var(--gold)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          AI systems, biosignals, edge devices
        </motion.p>
        <motion.h1
          className="text-display max-w-5xl text-5xl leading-[0.98] text-balance text-[var(--text)] md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {profile.name}
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl text-lg font-semibold text-[var(--text-soft)] md:text-xl"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {profile.role}
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <LinkButton href={profile.cv} label="View CV" icon={Download} variant="primary" />
          <LinkButton href={profile.github} label="GitHub" icon={Code2} />
          <LinkButton href={profile.linkedin} label="LinkedIn" icon={BriefcaseBusiness} />
          <LinkButton href="#contact" label="Contact" icon={Mail} variant="ghost" />
        </motion.div>

        <motion.div
          className="mt-10 grid gap-3 sm:grid-cols-3"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {profile.heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-[var(--line)] bg-[rgba(247,243,232,0.055)] p-4"
            >
              <p className="mb-1 text-xs font-semibold text-[var(--muted)]">{stat.label}</p>
              <p className="text-base font-black text-[var(--text)]">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="grid gap-4"
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.78, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <ImageFrame
          image={profile.portrait}
          priority
          ratio="aspect-[4/5]"
          className="glass-panel"
          imageClassName="object-[50%_24%]"
          sizes="(min-width: 1024px) 34vw, 100vw"
        >
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="rounded-lg border border-[var(--line)] bg-[rgba(7,9,15,0.82)] p-4 backdrop-blur-md">
              <p className="text-sm font-black text-[var(--text)]">{profile.education}</p>
              <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">{profile.location}</p>
            </div>
          </div>
        </ImageFrame>

        <a
          href="#projects"
          className="group flex items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-[rgba(126,207,143,0.08)] p-4 text-sm font-bold text-[var(--text)] transition duration-200 hover:-translate-y-1 hover:border-[rgba(126,207,143,0.5)] hover:bg-[rgba(126,207,143,0.12)]"
        >
          <span>Current lens: {profile.focusAreas.join(", ")}</span>
          <MoveRight
            aria-hidden="true"
            size={18}
            className="shrink-0 text-[var(--green)] transition group-hover:translate-x-1"
          />
        </a>
      </motion.div>
    </section>
  );
}
