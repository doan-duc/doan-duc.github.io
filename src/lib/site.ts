/* ===========================================================================
   SITE / IDENTITY CONFIG — single source of truth for name, contact, socials.
   =========================================================================== */
export const site = {
  name: "Duc Doan Sinh",
  initials: "DDS",
  role: "AI / Embedded Systems",
  tagline: "Efficient intelligence — from biosignals to the edge.",
  summary:
    "AI / Embedded Systems student building efficient, deployable intelligence — from wearable biosignals to multi-stream edge vision.",
  location: "Hanoi, Vietnam",
  education: "B.S. Smart Embedded Systems & IoT · HUST · expected 2027",
  available: "AI / Embedded Systems student",

  // 👉 Portrait — full natural color anchor. Swap at /public/images/profile.jpg
  portrait: { src: "/images/profile.jpg", alt: "Portrait of Duc Doan Sinh" },

  email: "doansinhduc@gmail.com",
  universityEmail: "Duc.DS234000@sis.hust.edu.vn",
  phone: "+84 928 161 469",
  github: "https://github.com/doan-duc",
  linkedin: "https://www.linkedin.com/in/doanduc2312",
  cv: "/files/duc-doan-sinh-cv.pdf",
  focusAreas: ["Neuromorphic AI", "Biomedical signals", "Edge vision", "RAG systems"],
  heroStats: [
    { label: "University", value: "HUST" },
    { label: "Exchange", value: "UTokyo" },
    { label: "Harvard HSIL", value: "2nd Place" },
  ],
} as const;

export const navLinks = [
  { id: "work", label: "Work" },
  { id: "highlight", label: "Featured" },
  { id: "capabilities", label: "Capabilities" },
  { id: "experience", label: "Now" },
  { id: "recognition", label: "Recognition" },
  { id: "contact", label: "Contact" },
] as const;
