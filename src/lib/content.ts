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
    title: "16-stream object detection on Jetson Nano",
    year: "2025",
    visualHint: "Reserved space for a future Jetson or multi-camera pipeline visual.",
    problem:
      "Running multi-camera vision on a Jetson Nano is a systems problem: 16 live streams must be decoded, batched, inferred, tracked, and rendered under tight compute and memory constraints.",
    built:
      "A 16-stream DeepStream pipeline on Jetson Nano using TensorRT FP16, batch inference, IOU tracking, and Docker, paired with a custom ~1.1M-parameter YOLOv8n distilled from a larger teacher model.",
    learned:
      "Throughput came from co-designing the model and the pipeline. Stream batching, inference intervals, TensorRT conversion, memory constraints, and model size mattered as much as detection accuracy.",
    matters:
      "It demonstrates that a multi-camera vision workload can be engineered around constrained edge hardware instead of requiring a discrete-GPU server.",
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
      "Packaging QA is not only about whether an item is present. Operators must place the right components, in the right locations, and in the right sequence across multiple assembly steps.",
    built:
      "OSCO combines an 11-class YOLOv8 detector with four RTSP cameras, orientation-aware slot maps, a shared two-layer checklist, and workflow validation. A custom slim-neck model reduces the vision core to ~1.9M parameters / 5.3 GFLOPs.",
    learned:
      "The detector is only the perception layer. Reliable visual QA also needs geometry, temporal confirmation, cross-camera state, and explicit workflow rules to understand the process rather than isolated frames.",
    matters:
      "It moves computer vision from object detection to process-aware inspection, allowing missing, misplaced, or out-of-order components to be flagged during packing rather than after the box is complete.",
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
    title: "Efficient AI & Model Optimization",
    blurb:
      "Designing smaller models for constrained compute without giving up useful performance.",
    skills: [
      "Spiking Neural Networks",
      "Neural Architecture Search",
      "Quantization",
      "Knowledge Distillation",
      "Pruning",
      "Model Compression",
    ],
  },
  {
    title: "Biosignals & Time-Series",
    blurb:
      "Learning robust representations from noisy physiological and time-series signals.",
    skills: [
      "ECG / PPG",
      "Signal Processing",
      "Signal Denoising",
      "Time-Series Learning",
      "Autoencoders",
    ],
  },
  {
    title: "Edge AI & Deployment",
    blurb:
      "Running AI reliably under real hardware, latency, memory, and streaming constraints.",
    skills: [
      "NVIDIA Jetson",
      "TensorRT",
      "DeepStream / GStreamer",
      "Docker",
      "ONNX",
      "RTSP Pipelines",
    ],
  },
  {
    title: "Computer Vision & AI Systems",
    blurb:
      "Building perception pipelines that connect models, cameras, state, and application logic.",
    skills: [
      "Object Detection",
      "Multi-Camera Vision",
      "Tracking",
      "Workflow Automation",
      "Real-Time Inference",
    ],
  },
];

export const skillMarquee = [
  "Spiking Neural Networks",
  "Neural Architecture Search",
  "Quantization",
  "Knowledge Distillation",
  "ECG / PPG",
  "Signal Processing",
  "Time-Series Learning",
  "NVIDIA Jetson",
  "TensorRT",
  "DeepStream / GStreamer",
  "Docker",
  "ONNX",
  "Object Detection",
  "Multi-Camera Vision",
  "Real-Time Inference",
];

/* -------- RESEARCH INTERESTS / CURRENT FOCUS ---------------------------- */
export type ResearchFocus = {
  title: string;
  body: string;
};

export const researchFocus: ResearchFocus[] = [
  {
    title: "Efficient AI for Biosignals",
    body:
      "Developing compact Spiking Neural Networks and neural architecture search (MLP-NAS) methods for ECG and PPG modeling, with an emphasis on efficient, deployable biosignal systems. KAN remains a smaller, exploratory direction within this work.",
  },
  {
    title: "Efficient Edge AI",
    body:
      "Developing, quantizing, and deploying real-time multi-camera computer vision on constrained edge hardware, balancing accuracy, latency, and compute efficiency.",
  },
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
    role: "Lab Member",
    org: "EDABK Laboratory, HUST",
    place: "Hanoi",
    body: "Researching SNN and MLP-NAS for ECG/PPG, with smaller exploratory work on KAN, alongside efficient computer-vision systems aimed at deployable AI.",
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
    title: "SCIC “Empowering Young Talent” Scholarship",
    place: "State Capital Investment Corporation (SCIC)",
    description:
      "Selected among 40 outstanding students for achievements in technology, AI, and innovation.",
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
