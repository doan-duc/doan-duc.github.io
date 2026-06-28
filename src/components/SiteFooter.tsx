import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="section-wrap flex flex-col gap-4 border-t border-[var(--line)] py-8 text-sm font-medium text-[var(--muted)] md:flex-row md:items-center md:justify-between">
      <p>{profile.name} portfolio</p>
      <a
        href="#home"
        className="inline-flex items-center gap-2 font-bold text-[var(--gold)] transition hover:-translate-y-1"
      >
        Back to top
        <ArrowUpRight aria-hidden="true" size={16} />
      </a>
    </footer>
  );
}
