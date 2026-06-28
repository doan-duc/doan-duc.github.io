"use client";

import { motion } from "framer-motion";
import { BriefcaseBusiness, Code2, Download, Mail, MoveRight } from "lucide-react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { profile } from "@/data/profile";

export function HeroSection() {
  return (
    <section
      id="home"
      className="scroll-chapter hero-cinematic relative min-h-screen overflow-hidden pb-16 pt-28 md:pt-32"
    >
      <div className="hero-sweep" aria-hidden="true" />
      <motion.div
        className="hero-photo-plane"
        initial={{ opacity: 0, x: 42, scale: 1.03 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <Image
          src={profile.portrait.src}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover object-[50%_22%]"
        />
        <div className="hero-photo-shade" />
      </motion.div>

      <div className="section-wide relative z-10 grid min-h-[calc(100vh-112px)] items-end">
        <div className="max-w-4xl pb-10 md:pb-16">
          <motion.p
            className="mb-4 text-sm font-semibold text-[var(--gold)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            AI systems / biosignals / edge devices
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
                className="hero-stat-card rounded-lg border border-[var(--line)] bg-[rgba(7,9,15,0.58)] p-4 backdrop-blur-xl"
              >
                <p className="mb-1 text-xs font-semibold text-[var(--muted)]">{stat.label}</p>
                <p className="text-base font-black text-[var(--text)]">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.a
            href="#projects"
            className="hero-lens-card group mt-4 flex max-w-2xl items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-[rgba(126,207,143,0.08)] p-4 text-sm font-bold text-[var(--text)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[rgba(126,207,143,0.5)] hover:bg-[rgba(126,207,143,0.12)]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>
              HUST Embedded Systems & IoT 2027 / Focus: biosignals, edge AI, RAG
            </span>
            <MoveRight
              aria-hidden="true"
              size={18}
              className="shrink-0 text-[var(--green)] transition group-hover:translate-x-1"
            />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
