/* ===========================================================================
   SITE CONTENT — edit copy here; every section reads from this file.
   =========================================================================== */

/* -------- ABOUT / MANIFESTO --------------------------------------------- */
export const about = {
  lead: "I build models that stay honest outside the notebook —",
  leadAccent:
    "when data is noisy, hardware is tiny, and the result has to serve a person.",
  body: [
    "I'm an Embedded Systems & IoT student at Hanoi University of Science and Technology, working where signal processing, efficient AI, and deployable systems overlap.",
    "The thread across everything I do is translation: from wearable biosignals to clinical insight, from heavy vision models to edge devices, and from research ideas to prototypes you can actually put in front of people.",
  ],
};

/* -------- SELECTED WORK (Problem → Built → Learned → Why) ---------------- */
export type Project = {
  index: string;
  eyebrow: string;
  title: string;
  year: string;
  problem: string;
  built: string;
  learned: string;
  matters: string;
  tags: string[];
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    index: "01",
    eyebrow: "Edge computer vision",
    title: "16-stream product recognition on Jetson Nano",
    year: "2025",
    problem:
      "Multi-camera retail and industrial systems need real detection speed without leaning on expensive server hardware.",
    built:
      "A DeepStream + GStreamer pipeline (Docker, TensorRT, YOLOv8n) processing 16 concurrent RTSP streams on a single NVIDIA Jetson Nano.",
    learned:
      "The bottleneck usually sits outside the model — stream scheduling, memory, container setup, and inference conversion decide whether it ships.",
    matters:
      "It turns computer vision from a demo into infrastructure that runs next to the camera, cutting latency and bandwidth cost.",
    tags: ["DeepStream", "TensorRT", "YOLOv8n", "Jetson"],
    link: {
      label: "Repository",
      href: "https://github.com/doan-duc/DeepStream-YOLOv8-Jetson-Nano-16RTSP",
    },
  },
  {
    index: "02",
    eyebrow: "Industrial QA",
    title: "Electronic packaging control system",
    year: "2025",
    problem:
      "Manual packaging checks are easy to miss as small electronic components move through multi-step production lines.",
    built:
      "A YOLOv8n system covering 11 component classes that tracks a 2-tier packaging pipeline across four camera streams.",
    learned:
      "A useful QA model has to understand workflow state — not just objects in isolated frames.",
    matters:
      "It points toward reliable factory assistance where AI backs up repeatable human inspection instead of replacing it.",
    tags: ["YOLO", "Tracking", "QA", "Automation"],
    link: {
      label: "Repository",
      href: "https://github.com/doan-duc/OSCO-Object-Scanning-and-Checklist-Optimization",
    },
  },
  {
    index: "03",
    eyebrow: "Applied AI · internship",
    title: "RAG support assistant + YOLO deployment",
    year: "2025",
    problem:
      "Support teams drown in repetitive questions while deployed vision models quietly drift out of spec.",
    built:
      "A retrieval-augmented support assistant and a YOLO deployment-optimization workflow built during an applied-AI internship at Viettel Telecom & HANET.",
    learned:
      "Retrieval quality and grounding matter more than model size — and a deployment is only as good as the loop that keeps watching it.",
    matters:
      "It connects research instincts to production constraints: latency, cost, and answers people can trust.",
    tags: ["RAG", "LLM", "YOLO", "MLOps"],
  },
];

/* -------- FEATURED / PINNED DEEP-DIVE ----------------------------------- */
export const highlight = {
  eyebrow: "Featured research",
  title: "Ear-to-chest ECG reconstruction",
  subtitle:
    "A quantized spiking-neural-network autoencoder that rebuilds chest-style ECG from a noisy ear-worn sensor — small enough to live on the edge.",
  chips: ["Spiking NN", "ECG · biosignals", "Quantized", "Edge-ready"],
  link: { label: "View repository", href: "https://github.com/doan-duc/ecg_perceptual" },
  phases: [
    {
      key: "01",
      label: "The problem",
      body:
        "Ear-worn ECG is comfortable and wearable, but the signal is noisy and shaped completely differently from a clinical chest lead — which makes interpretation hard.",
    },
    {
      key: "02",
      label: "What I built",
      body:
        "A quantized SNN autoencoder that reconstructs chest-style ECG from short ear-worn windows, kept compact enough for on-device, edge-research deployment.",
    },
    {
      key: "03",
      label: "What I learned",
      body:
        "Personalization can be the whole game — the gap between a promising global model and one that actually works for a specific patient.",
    },
    {
      key: "04",
      label: "Why it matters",
      body:
        "Better reconstruction makes wearable biosignal monitoring practical, without forcing people into uncomfortable clinical sensor setups.",
    },
  ],
};

/* -------- CAPABILITIES --------------------------------------------------- */
export const capabilities = [
  {
    title: "Efficient AI & models",
    blurb: "Making networks small, fast, and still trustworthy.",
    skills: ["Spiking NN (SNN)", "KAN", "Neural Arch. Search", "Quantization", "Knowledge distillation"],
  },
  {
    title: "Biosignals & perception",
    blurb: "Turning messy real-world signals into something readable.",
    skills: ["ECG / PPG", "Signal denoising", "Autoencoders", "Computer vision", "Detection & tracking"],
  },
  {
    title: "Edge deployment",
    blurb: "Getting models to run next to the sensor, in real time.",
    skills: ["NVIDIA Jetson", "TensorRT", "DeepStream / GStreamer", "Docker", "RTSP pipelines"],
  },
  {
    title: "Applied systems",
    blurb: "Wiring research into products people can use.",
    skills: ["PyTorch", "Python", "RAG / LLM apps", "Multi-stream inference", "Real-time tracking"],
  },
];

// Flat list for the infinite marquee row.
export const skillMarquee = [
  "Spiking NN", "KAN", "NAS", "Quantization", "ECG / PPG", "Autoencoders",
  "TensorRT", "Jetson", "DeepStream", "YOLOv8", "PyTorch", "RAG", "Docker",
  "Edge AI", "Computer vision",
];

/* -------- NOW / EXPERIENCE ---------------------------------------------- */
export type Engagement = {
  period: string;
  role: string;
  org: string;
  place: string;
  body: string;
};

export const experience: Engagement[] = [
  {
    period: "Now",
    role: "AI Researcher",
    org: "EDABK Laboratory, HUST",
    place: "Hanoi",
    body: "Researching SNN, KAN, MLP-NAS, ECG/PPG, and efficient computer-vision systems aimed at deployable AI.",
  },
  {
    period: "Now",
    role: "Applied-AI Intern",
    org: "Viettel Telecom & HANET",
    place: "Hanoi",
    body: "Designing a RAG support assistant and optimizing YOLO deployment for production AI systems.",
  },
  {
    period: "Now",
    role: "Teaching Assistant",
    org: "Matsuo-Iwasawa Laboratory",
    place: "UTokyo · remote",
    body: "Supporting the Global Consumer Intelligence course — ML concepts, assignments, and student feedback.",
  },
  {
    period: "Next",
    role: "What I want to build",
    org: "Research → products",
    place: "—",
    body: "AI systems that connect biomedical signals, embedded deployment, and interfaces real users actually trust.",
  },
];

/* -------- RECOGNITION ----------------------------------------------------
   Awards stay text-only. Journey photos live in `recognitionMoments` below.
   Exact, case-sensitive filenames matter on GitHub Pages. */
export type RecognitionMoment = {
  src: string;
  alt: string;
  caption: string;
  location: string;
};
export type Award = {
  year: string;
  title: string;
  place: string;
  description: string;
};

export const recognition: Award[] = [
  {
    year: "2026",
    title: "Harvard HSIL Hackathon",
    place: "Vietnam Hub · Global",
    description:
      "2nd Place at the Vietnam Hub and Top 100 Global Teams — selected from 14,700+ applications worldwide.",
  },
  {
    year: "2026",
    title: "University of Tokyo research exchange",
    place: "Matsuo-Iwasawa Laboratory",
    description:
      "Short-term AI research exchange in Japan — presenting work, receiving feedback, and stepping into an international research culture.",
  },
  {
    year: "2025",
    title: "Outstanding Student — GCI",
    place: "Matsuo-Iwasawa Laboratory, UTokyo",
    description:
      "Top 20 most outstanding students in the Global Consumer Intelligence course 2025.",
  },
  {
    year: "2025",
    title: "Bosch CodeRace Challenge",
    place: "Bosch Global Software Technologies VN",
    description:
      "Top 30 team in a national challenge testing practical engineering, software thinking, and teamwork.",
  },
];

export const recognitionMoments: RecognitionMoment[] = [
  // VN: "Yasuda Auditorium, Đại học Tokyo"
  {
    src: "/images/Yasuda_Auditorium.png",
    alt: "Yasuda Auditorium, University of Tokyo",
    caption: "Yasuda Auditorium, University of Tokyo",
    location: "University of Tokyo, Tokyo",
  },
  // VN: "Thuyết trình tại Matsuo-Iwasawa Lab"
  {
    src: "/images/presentation_with_Matsuolab.JPG",
    alt: "Presenting work at Matsuo-Iwasawa Laboratory",
    caption: "Presenting my work at the Matsuo-Iwasawa Lab",
    location: "Matsuo-Iwasawa Laboratory, UTokyo",
  },
  // VN: "Bữa tối thân mật với giáo sư Matsuo tại Shangri-La Hotel"
  {
    src: "/images/dinner_in_Shangrila_hotel.JPG",
    alt: "Dinner at Shangri-La Hotel with Professor Matsuo and the lab",
    caption: "An evening with Professor Matsuo and the lab",
    location: "Shangri-La Hotel, Tokyo",
  },
  // VN: "Lễ trao giải — Giải Nhì, Vietnam Hub"
  {
    src: "/images/Harvard_Hackathon.jpg",
    alt: "Harvard HSIL Hackathon award ceremony, Vietnam Hub",
    caption: "Award ceremony — 2nd place, Vietnam Hub",
    location: "Phenikaa University, Hanoi",
  },
];
