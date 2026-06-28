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
import { PhotoJourneySection } from "@/components/sections/PhotoJourneySection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";

export function PortfolioPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <HighlightsSection />
        <ProjectsSection />
        <AwardsSection />
        <ExperiencesSection />
        <PhotoJourneySection />
        <NowSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
