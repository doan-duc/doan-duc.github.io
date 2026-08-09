/* ===========================================================================
   SITE CONTENT
   Every section reads from this file.
   =========================================================================== */

/* -------- ABOUT / MANIFESTO --------------------------------------------- */
export const about = {
  lead: "I build AI systems that work beyond the notebook",
  leadAccent:
    "— where signals are noisy, hardware is constrained, and technology has to work for people.",
  body: [
    "I'm an Embedded Systems & IoT undergraduate at Hanoi University of Science and Technology, focusing on signal processing, efficient AI, and deployable intelligent systems.",
    "The common thread across my work is turning ideas into systems: from wearable biosignals to meaningful health insights, from large vision models to efficient edge deployments, and from research experiments to prototypes that work in the real world.",
  ],
};

/* -------- SELECTED WORK -------------------------------------------------- */
export type ProjectDemo = {
  src: string;
  poster: string;
  title: string;
  triggerLabel: string;
  ariaLabel: string;
  duration: string;
};

export type Project = {
  index: string;
  eyebrow: string;
  title: string;
  year: string;
  visualHint: string;
  problem: string;
  built: string;
  learned: string;
  matters: string;
  tags: string[];
  demo?: ProjectDemo;
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    index: "01",
    eyebrow: "Edge computer vision",
    title: "16-stream product recognition on Jetson Nano",
    year: "2025",
    visualHint: "Reserved space for a future Jetson or multi-camera pipeline visual.",
    problem:
      "Multi-camera retail and industrial systems need real detection speed without leaning on expensive server hardware.",
    built:
      "A DeepStream + GStreamer pipeline (Docker, TensorRT, YOLOv8n) processing 16 concurrent RTSP streams on a single NVIDIA Jetson Nano.",
    learned:
      "The bottleneck usually sits outside the model: stream scheduling, memory, container setup, and inference conversion decide whether it ships.",
    matters:
      "It turns computer vision from a demo into infrastructure that runs next to the camera, cutting latency and bandwidth cost.",
    tags: ["DeepStream", "TensorRT", "YOLOv8n", "Jetson"],
    demo: {
      src: "/video/16cam-jetson-demo.mp4",
      poster: "/images/projects/16cam-jetson-demo.jpg",
      title: "16-camera inference on Jetson Nano",
      triggerLabel: "Play 16-camera demo",
      ariaLabel: "16-camera Jetson Nano project demo",
      duration: "0:49",
    },
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
    visualHint: "Reserved space for a future packaging inspection visual.",
    problem:
      "Manual packaging checks are easy to miss as small electronic components move through multi-step production lines.",
    built:
      "A YOLOv8n system covering 11 component classes that tracks a 2-tier packaging pipeline across four camera streams.",
    learned:
      "A useful QA model has to understand workflow state, not just objects in isolated frames.",
    matters:
      "It points toward reliable factory assistance where AI backs up repeatable human inspection instead of replacing it.",
    tags: ["YOLO", "Tracking", "QA", "Automation"],
    demo: {
      src: "/video/osco-demo.mp4",
      poster: "/images/projects/osco-demo.jpg",
      title: "OSCO packaging control workflow",
      triggerLabel: "Play OSCO demo",
      ariaLabel: "OSCO packaging control project demo",
      duration: "5:00",
    },
    link: {
      label: "Repository",
      href: "https://github.com/doan-duc/OSCO-Object-Scanning-and-Checklist-Optimization",
    },
  },
  {
    index: "03",
    eyebrow: "Applied AI internship",
    title: "RAG support assistant + YOLO deployment",
    year: "2025",
    visualHint: "Reserved space for a future retrieval or deployment workflow visual.",
    problem:
      "Support teams drown in repetitive questions while deployed vision models quietly drift out of spec.",
    built:
      "A retrieval-augmented support assistant and a YOLO deployment-optimization workflow built during an applied-AI internship at Viettel Telecom & HANET.",
    learned:
      "Retrieval quality and grounding matter more than model size, and a deployment is only as good as the loop that keeps watching it.",
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
    "A compact 4-bit Spiking Denoising Convolutional Autoencoder (SDCAE) for reconstructing chest-reference ECG signals from single-ear recordings.",
  chips: ["Spiking NN", "ECG biosignals", "4-bit LSQ", "LOSO evaluation"],
  link: {
    label: "View repository",
    href: "https://github.com/doan-duc/ear-to-chest-ecg-reconstruction",
  },
  phases: [
    {
      key: "01",
      label: "The problem",
      body:
        "Single-ear ECG is wearable-friendly but differs from a chest-reference signal, making faithful morphology reconstruction a challenging subject-independent research problem.",
    },
    {
      key: "02",
      label: "What I built",
      body:
        "A 23,140-parameter 1D SDCAE with 4-bit LSQ-quantized convolution layers and integer multi-level spike activations, plus an offline training and evaluation pipeline.",
    },
    {
      key: "03",
      label: "Evaluation",
      body:
        "Across 12 private leave-one-subject-out folds, SDCAE reached 0.873 +/- 0.039 PQRST-Pearson and 0.862 full-window correlation, with an 11.3 KB theoretical packed weight footprint.",
    },
    {
      key: "04",
      label: "Scope",
      body:
        "Results are an offline research benchmark on private paired data. The system is not diagnostic, not a medical device, and real-time deployment has not been demonstrated.",
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
    place: "UTokyo, remote",
    body: "Supporting the Global Consumer Intelligence course: ML concepts, assignments, and student feedback.",
  },
  {
    period: "Next",
    role: "What I want to build",
    org: "Research to products",
    place: "Future",
    body: "AI systems that connect biomedical signals, embedded deployment, and interfaces real users actually trust.",
  },
];

/* -------- RECOGNITION ----------------------------------------------------
   Awards stay text-only. Journey photos live in `recognitionMoments` below.
   Exact, case-sensitive filenames matter on GitHub Pages. */
export type RecognitionMoment = {
  src: string;
  webpSrc: string;
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
    place: "Vietnam Hub, Global",
    description:
      "2nd Place at the Vietnam Hub and Top 100 Global Teams, selected from 14,700+ applications worldwide.",
  },
  {
    year: "2026",
    title: "University of Tokyo research exchange",
    place: "Matsuo-Iwasawa Laboratory",
    description:
      "Short-term AI research exchange in Japan: presenting work, receiving feedback, and stepping into an international research culture.",
  },
  {
    year: "2025",
    title: "Outstanding Student, GCI",
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
  {
    src: "/images/Yasuda_Auditorium.png",
    webpSrc: "/images/Yasuda_Auditorium.webp",
    alt: "Yasuda Auditorium, University of Tokyo",
    caption: "Yasuda Auditorium, University of Tokyo",
    location: "University of Tokyo, Tokyo",
  },
  {
    src: "/images/Harvard_Hackathon.jpg",
    webpSrc: "/images/Harvard_Hackathon.webp",
    alt: "Harvard HSIL Hackathon award ceremony, Vietnam Hub",
    caption: "Award ceremony, 2nd place, Vietnam Hub",
    location: "Phenikaa University, Hanoi",
  },
];
