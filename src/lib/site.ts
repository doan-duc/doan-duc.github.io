/* ===========================================================================
   SITE / IDENTITY CONFIG
   Single source of truth for name, contact, socials.
   =========================================================================== */
export const site = {
  name: "Duc Doan Sinh",
  initials: "DDS",
  role: "AI / Embedded Systems",
  // ECG/SNN-specific positioning is intentionally hidden from public copy.
  // tagline: "Efficient intelligence from biosignals to the edge.",
  tagline: "Efficient intelligence for real-world systems.",
  // summary: "AI / Embedded Systems student building efficient, deployable intelligence from wearable biosignals to multi-stream edge vision.",
  summary:
    "AI / Embedded Systems student building efficient, deployable intelligence for multi-stream edge vision and real-world applications.",
  location: "Hanoi, Vietnam",
  education: "B.S. Smart Embedded Systems & IoT, HUST, expected 2027",
  available: "AI / Embedded Systems student",

  // Portrait: full natural color anchor. Swap at /public/images/profile.jpg.
  portrait: {
    src: "/images/profile.jpg",
    webpSrc: "/images/profile.webp",
    alt: "Portrait of Duc Doan Sinh",
  },

  email: "doansinhduc@gmail.com",
  universityEmail: "Duc.DS234000@sis.hust.edu.vn",
  phone: "+84 928 161 469",
  github: "https://github.com/doan-duc",
  linkedin: "https://www.linkedin.com/in/doanduc2312",
  // focusAreas: ["Neuromorphic AI", "Biomedical signals", "Edge vision", "RAG systems"],
  focusAreas: ["Efficient AI", "Edge vision", "RAG systems"],
  affiliations: [
    {
      id: "hust",
      acronym: "HUST",
      kind: "University",
      name: "Hanoi University of Science and Technology",
      detail: "B.S. Smart Embedded Systems & IoT",
      meta: "Expected 2027",
      url: "https://hust.edu.vn/",
      logo: {
        src: "/images/hust-logo.png",
        width: 130,
        height: 194,
        sizes: "48px",
      },
    },
    {
      id: "edabk",
      acronym: "EDABK",
      kind: "Research lab",
      name: "EDABK Research Lab",
      detail: "Lab Member",
      meta: "SEEE, HUST",
      url: "https://sites.google.com/set.hust.edu.vn/hust-edabk-lab/home",
      logo: {
        src: "/images/EDABK.png",
        width: 730,
        height: 433,
        sizes: "88px",
      },
    },
  ],
} as const;

export const navLinks = [
  { id: "about", label: "About" },
  // { id: "featured", label: "Research" }, // ECG/SNN research is not public.
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
] as const;
