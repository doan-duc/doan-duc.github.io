/* ===========================================================================
   SITE / IDENTITY CONFIG
   👉 Swap any public-facing identity field here. This is the single source of
      truth for name, contact, and social links across the whole site.
   =========================================================================== */

export const site = {
  name: "Duc Doan Sinh",
  initials: "DDS",

  // Short hero tagline (kept punchy — the big statement lives in Hero.tsx)
  role: "AI / Embedded Systems",
  tagline: "Efficient intelligence — from biosignals to the edge.",

  // Longer positioning line used in <meta> + About
  summary:
    "AI / Embedded Systems student building efficient, deployable intelligence — from wearable biosignals to multi-stream edge vision.",

  location: "Hanoi, Vietnam",
  education: "B.S. Smart Embedded Systems & IoT · HUST · expected 2027",
  available: "Open to research & internships",

  // Portrait — replace the file at /public/images/profile.jpg
  portrait: {
    src: "/images/profile.jpg",
    alt: "Portrait of Duc Doan Sinh",
  },

  // Contact + socials
  email: "doansinhduc@gmail.com",
  universityEmail: "Duc.DS234000@sis.hust.edu.vn",
  phone: "+84 928 161 469",
  github: "https://github.com/doan-duc",
  linkedin: "https://www.linkedin.com/in/doanduc2312",
  cv: "/files/duc-doan-sinh-cv.pdf", // replace the PDF in /public/files

  // Four words that describe the work — used in the hero marquee
  focusAreas: ["Neuromorphic AI", "Biomedical signals", "Edge vision", "RAG systems"],

  // Small proof chips under the hero
  heroStats: [
    { label: "Research home", value: "EDABK Lab" },
    { label: "Exchange", value: "UTokyo" },
    { label: "Harvard HSIL", value: "Top 100 Global" },
  ],
} as const;

// In-page navigation. `id` must match the <section id> in page.tsx.
export const navLinks = [
  { id: "work", label: "Work" },
  { id: "highlight", label: "Featured" },
  { id: "capabilities", label: "Capabilities" },
  { id: "experience", label: "Now" },
  { id: "contact", label: "Contact" },
] as const;
