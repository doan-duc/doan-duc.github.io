import { site, navLinks } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Github, Linkedin, Mail } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-line py-14">
      <Container className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-2xl tracking-normal md:tracking-tight">
            {site.name}
            <span className="text-accent">.</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted">{site.education}</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-accent"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </Container>

      <Container className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</span>
      </Container>
    </footer>
  );
}
