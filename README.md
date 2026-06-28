# Duc Doan Sinh — Portfolio

An award-style, editorial dark portfolio for an AI / Embedded Systems student.
Built to feel closer to linear.app / Awwwards "Site of the Day" than a CV or a
default AI-portfolio template.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · GSAP + ScrollTrigger ·
Lenis · Framer Motion · TypeScript.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
```

---

## File structure

```
portfolio/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx          # fonts, metadata, providers, background, nav, footer
│  │  ├─ page.tsx            # composes the 8 sections (order documented inline)
│  │  └─ globals.css         # design tokens (@theme), aurora/grain CSS, Lenis CSS
│  ├─ lib/
│  │  ├─ site.ts             # 👉 identity, contact, socials, nav (single source)
│  │  ├─ content.ts          # 👉 all section copy: about/projects/highlight/etc.
│  │  ├─ utils.ts            # cn(), prefersReducedMotion()
│  │  └─ use-iso-layout-effect.ts
│  └─ components/
│     ├─ providers/SmoothScroll.tsx   # Lenis ↔ GSAP ScrollTrigger sync + context
│     ├─ background/
│     │  ├─ Background.tsx             # composes the ambient layers (fixed, -z-10)
│     │  ├─ AuroraField.tsx           # drifting mesh-gradient blobs
│     │  └─ ParticleField.tsx         # mouse-reactive canvas constellation
│     ├─ motion/
│     │  ├─ Reveal.tsx                # GSAP reveal-on-scroll (stagger optional)
│     │  ├─ Parallax.tsx              # scrubbed scroll parallax
│     │  ├─ TiltCard.tsx              # 3D hover tilt (Framer)
│     │  ├─ Magnetic.tsx              # magnetic hover (Framer)
│     │  └─ ScrollProgress.tsx        # top progress bar (Framer useScroll)
│     ├─ layout/
│     │  ├─ Nav.tsx                   # floating nav + mobile overlay
│     │  └─ Footer.tsx
│     ├─ ui/
│     │  ├─ Container.tsx · SectionHeader.tsx · Tag.tsx · icons.tsx
│     └─ sections/
│        ├─ Hero.tsx · About.tsx · Work.tsx · Highlight.tsx
│        └─ Capabilities.tsx · Experience.tsx · Recognition.tsx · Contact.tsx
└─ public/
   ├─ images/profile.jpg              # 👉 swap portrait
   └─ files/duc-doan-sinh-cv.pdf      # 👉 swap CV
```

## Where to edit content

- **Identity / links:** `src/lib/site.ts`
- **All section copy:** `src/lib/content.ts`
- **Accent color (one place):** `src/app/globals.css` → `@theme { --color-accent }`
  (violet `#7c3aed` · cyan `#06b6d4` · lime `#84cc16`)
- **Portrait / CV:** replace the files in `public/`

---

## Design rationale

- **Restraint over decoration.** Near-black `#0a0a0a`, one accent used sparingly,
  huge type, lots of negative space. What reads as "premium" is the restraint and
  the grain — not a louder hue. The accent is a single token so it's trivial to swap.
- **Depth from layers, not boxes.** A drifting aurora mesh + a ~3.5% film grain over
  everything + a vignette give the page atmosphere without the generic card-grid look.
  Work is presented as full-width editorial rows, capabilities as a bordered matrix.
- **Motion with a clear division of labor.** Lenis drives smooth scroll; GSAP +
  ScrollTrigger own all scroll-driven choreography (reveals, parallax, the pinned
  horizontal highlight); Framer Motion is limited to component micro-interactions
  (tilt, magnetic, hero load stagger, progress bar). Lenis and GSAP share one RAF
  ticker so they never fight — the key to staying at 60fps.
- **Accessible by default.** `prefers-reduced-motion` disables smooth scroll, aurora
  drift, grain shimmer, and all reveal/parallax animations; content renders fully via
  SSR so nothing depends on JS to be readable.
- **Performance choices.** The particle field is a lightweight 2D canvas (~64 nodes),
  deliberately chosen over React Three Fiber to avoid a 3D bundle while keeping the
  mouse-reactive feel. Reveals run in a layout effect so there's no first-paint flash.

---

## Deploy

- **Vercel (recommended):** import the repo, no config needed.
- **GitHub Pages (static export):** uncomment `output: "export"` + `images.unoptimized`
  in `next.config.mjs`, then `npm run build` and publish `out/`.
