# Duc Doan Sinh Profile Website

Professional personal profile website for an AI / Embedded Systems student, built with Next.js, Tailwind CSS, and Framer Motion.

## UI / UX Concept

The site is designed as a narrative portfolio, not a second CV. The structure moves from identity to proof:

1. Hero: name, positioning, portrait, primary links.
2. About: personal direction and research identity.
3. Featured Highlights: major credibility signals with photos.
4. Projects / Research: story-driven project cards using Problem -> Built -> Learned -> Matters.
5. Awards: timeline-style recognitions with context.
6. Experiences: international, lab, conference, and competition milestones.
7. Photo Journey: curated visual timeline where every image has a reason.
8. Now / Contact: current work, future direction, and links.

## Color Palette

- Deep ink: `#07090f`
- Soft panel: `rgba(17, 23, 31, 0.82)`
- Warm text: `#f7f3e8`
- Research gold: `#e7bc5c`
- Signal cyan: `#46c7d8`
- Systems green: `#7ecf8f`
- Human coral: `#ec7763`
- Accent violet: `#a98bdc`

The palette avoids generic neon-AI styling by mixing warm academic contrast with precise technical accents.

## Component Breakdown

- `src/components/PortfolioPage.tsx`: page composition.
- `src/components/SiteHeader.tsx`: fixed navigation and scroll progress.
- `src/components/SiteFooter.tsx`: footer and back-to-top link.
- `src/components/ui/Reveal.tsx`: reusable Framer Motion reveal.
- `src/components/ui/ImageFrame.tsx`: responsive image container with overlay and hover treatment.
- `src/components/ui/LinkButton.tsx`: reusable CTA/link button.
- `src/components/ui/SectionHeading.tsx`: consistent section intro.
- `src/components/sections/*`: each portfolio section as an isolated module.
- `src/data/profile.ts`: all editable personal content, project copy, links, and image references.

## Replace Content

Most updates should happen in `src/data/profile.ts`.

Replace images in:

- `public/images/profile.jpg`
- `public/images/yasuda-auditorium.jpg`
- `public/images/matsuo-presentation.jpg`
- `public/images/matsuo-dinner.jpg`
- `public/images/harvard-hackathon.jpg`

Replace the CV at:

- `public/files/duc-doan-sinh-cv.pdf`

Project cards currently use contextual photos where project posters/screenshots are not available. Replace those image paths in `projects` when you have actual diagrams, screenshots, or paper posters.

## Run Locally

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Build

```powershell
npm run build
```

The project is configured with static export support through `next.config.mjs`, so the production build is suitable for static hosting.
