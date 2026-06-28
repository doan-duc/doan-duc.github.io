"use client";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AboutSection } from "@/components/sections/AboutSection";
import { AwardsSection } from "@/components/sections/AwardsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExperiencesSection } from "@/components/sections/ExperiencesSection";
import { HighlightsSection } from "@/components/sections/HighlightsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { NowSection } from "@/components/sections/NowSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ThreeBackground } from "@/components/ThreeBackground";

export function PortfolioPage() {
  return (
    <div className="site-shell">
      <ThreeBackground />
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <HighlightsSection />
        <ProjectsSection />
        <AwardsSection />
        <ExperiencesSection />
        <NowSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
