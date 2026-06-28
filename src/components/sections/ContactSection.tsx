import { BriefcaseBusiness, Code2, Download, Mail, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section id="contact" className="section-wrap py-20 md:py-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.62fr)] lg:items-start">
        <SectionHeading
          eyebrow="Contact"
          title="Open to research collaboration and AI engineering work."
          description="The strongest fit is work around neuromorphic AI, biomedical signal processing, efficient computer vision deployment, RAG systems, and embedded intelligence."
        />

        <Reveal delay={0.08} className="glass-panel p-5 md:p-6">
          <div className="grid gap-3">
            <LinkButton href={`mailto:${profile.email}`} label={profile.email} icon={Mail} variant="primary" />
            <LinkButton
              href={`mailto:${profile.universityEmail}`}
              label={profile.universityEmail}
              icon={Mail}
            />
            <LinkButton href={`tel:${profile.phone.replaceAll(" ", "")}`} label={profile.phone} icon={Phone} />
            <LinkButton href={profile.github} label="GitHub" icon={Code2} />
            <LinkButton href={profile.linkedin} label="LinkedIn" icon={BriefcaseBusiness} />
            <LinkButton href={profile.cv} label="Download CV" icon={Download} variant="ghost" download />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
