import type { LucideIcon } from "lucide-react";
import {
  Award,
  BrainCircuit,
  Cpu,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  MapPinned,
  Presentation,
  Rocket,
  Trophy
} from "lucide-react";

export type LinkItem = {
  label: string;
  href: string;
};

export type Visual = {
  src: string;
  alt: string;
};

export type Highlight = {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
};

export type Project = {
  title: string;
  eyebrow: string;
  visual: "ecg" | "streams" | "qa";
  problem: string;
  built: string;
  learned: string;
  matters: string;
  tags: string[];
  link?: LinkItem;
};

export type TimelineItem = {
  year: string;
  title: string;
  place: string;
  description: string;
  image?: Visual;
  icon: LucideIcon;
};

export type Experience = {
  title: string;
  date: string;
  place: string;
  story: string;
  image: Visual;
};

export type JourneyPhoto = {
  chapter: string;
  title: string;
  caption: string;
  image: Visual;
};

export const profile = {
  // Replace these identity fields when you want a different public positioning.
  name: "Duc Doan Sinh",
  initials: "DDS",
  role: "AI/Embedded Systems student building efficient intelligence from biosignals to edge devices.",
  location: "Hanoi, Vietnam",
  education: "B.S. Smart Embedded Systems and IoT, HUST, expected 2027",
  portrait: {
    src: "/images/profile.jpg",
    alt: "Portrait of Duc Doan Sinh"
  },
  email: "doansinhduc@gmail.com",
  universityEmail: "Duc.DS234000@sis.hust.edu.vn",
  phone: "+84 928 161 469",
  github: "https://github.com/doan-duc",
  linkedin: "https://www.linkedin.com/in/doanduc2312",
  cv: "/files/duc-doan-sinh-cv.pdf",
  focusAreas: ["Neuromorphic AI", "Biomedical signals", "Edge vision", "RAG systems"],
  heroStats: [
    { label: "Research home", value: "EDABK Lab" },
    { label: "Global experience", value: "UTokyo" },
    { label: "Competition signal", value: "HSIL Top 100" }
  ]
};

export const about = {
  // Replace this paragraph with your more personal story when you want a warmer voice.
  intro:
    "I am an Embedded Systems and IoT student at Hanoi University of Science and Technology, working at the intersection of signal processing, efficient AI, and deployable systems. My direction is simple: build models that are not only accurate in notebooks, but also meaningful when data is noisy, hardware is constrained, and the result has to serve people.",
  note:
    "The thread across my work is translation: from wearable biosignals to clinical insight, from vision models to edge devices, and from research ideas to prototypes that can be tested in the real world."
};

export const highlights: Highlight[] = [
  {
    eyebrow: "Research exchange",
    title: "University of Tokyo exchange",
    description:
      "A short-term AI research exchange that connected my HUST direction with a stronger international research frame.",
    icon: GraduationCap
  },
  {
    eyebrow: "Research communication",
    title: "Presentation with Matsuo Lab",
    description:
      "The presentation photo belongs here: UTokyo exchange, presenting and receiving feedback from Matsuo-Iwasawa Laboratory members.",
    icon: Presentation
  },
  {
    eyebrow: "Health innovation",
    title: "Harvard HSIL Hackathon 2026",
    description:
      "2nd Place Winner at the Vietnam Hub and selected among the Top 100 Global Teams from 14,700+ applications.",
    icon: Trophy
  },
  {
    eyebrow: "Lab direction",
    title: "EDABK Laboratory, HUST",
    description:
      "Researching SNN, KAN, NAS, ECG, PPG, and efficient computer vision systems with a focus on deployable AI.",
    icon: Lightbulb
  }
];

export const projects: Project[] = [
  {
    eyebrow: "Wearable biosignal AI",
    title: "Ear-to-chest ECG reconstruction",
    visual: "ecg",
    problem:
      "Ear-worn ECG is convenient, but the signal is noisy and shaped differently from chest ECG, making clinical interpretation harder.",
    built:
      "A quantized SNN autoencoder that reconstructs chest-style ECG from ear-worn ECG windows while staying compact enough for edge research.",
    learned:
      "Personalization can be the difference between a promising global model and a model that works for an individual patient.",
    matters:
      "Better reconstruction can make wearable biosignal monitoring more practical without forcing users into uncomfortable sensor setups.",
    tags: ["SNN", "ECG", "Quantization", "Edge AI"],
    link: {
      label: "View repository",
      href: "https://github.com/doan-duc/ecg_perceptual"
    }
  },
  {
    eyebrow: "Edge computer vision",
    title: "16-stream product recognition on Jetson Nano",
    visual: "streams",
    problem:
      "Multi-camera retail or industrial systems need practical detection speed without relying on expensive server hardware.",
    built:
      "A DeepStream and GStreamer pipeline using Docker, TensorRT, and YOLOv8n to process 16 RTSP streams on NVIDIA Jetson Nano.",
    learned:
      "Deployment bottlenecks often sit outside the model: stream scheduling, memory, container setup, and inference conversion all matter.",
    matters:
      "It turns computer vision from a demo into infrastructure that can run near the camera, reducing latency and bandwidth cost.",
    tags: ["DeepStream", "TensorRT", "YOLOv8n", "Jetson"],
    link: {
      label: "View repository",
      href: "https://github.com/doan-duc/DeepStream-YOLOv8-Jetson-Nano-16RTSP"
    }
  },
  {
    eyebrow: "Industrial QA",
    title: "Electronic packaging control system",
    visual: "qa",
    problem:
      "Manual packaging checks are easy to miss when small electronic components move through multi-step production lines.",
    built:
      "A YOLOv8n-based system for 11 component classes, tracking a 2-tier packaging pipeline across four camera streams.",
    learned:
      "A good QA model has to understand workflow state, not only individual objects in isolated frames.",
    matters:
      "The project points toward more reliable factory assistance systems where AI supports repeatable human inspection.",
    tags: ["YOLO", "Tracking", "QA", "Automation"],
    link: {
      label: "View repository",
      href: "https://github.com/doan-duc/OSCO-Object-Scanning-and-Checklist-Optimization"
    }
  }
];

export const awards: TimelineItem[] = [
  {
    year: "2026",
    title: "Harvard HSIL Hackathon",
    place: "Vietnam Hub / Global",
    description:
      "2nd Place Winner at Vietnam Hub and Top 100 Global Teams, selected from 14,700+ applications worldwide.",
    icon: Award
  },
  {
    year: "2025",
    title: "Outstanding Student, GCI",
    place: "Matsuo-Iwasawa Laboratory",
    description:
      "Selected as one of the Top 20 most outstanding students in Global Consumer Intelligence Course 2025.",
    icon: Presentation
  },
  {
    year: "2025",
    title: "Bosch CodeRace Challenge",
    place: "Bosch Global Software Technologies Vietnam",
    description:
      "Top 30 team in a national challenge that tested practical engineering, software thinking, and teamwork.",
    icon: Cpu
  }
];

export const experiences: Experience[] = [
  {
    title: "Photo in Yasuda Auditorium",
    date: "March 2025",
    place: "The University of Tokyo, Japan",
    story:
      "This image is used only for the UTokyo exchange milestone: standing at Yasuda Auditorium and seeing the scale of the research environment more clearly.",
    image: {
      src: "/images/yasuda-auditorium.jpg",
      alt: "Duc Doan Sinh at Yasuda Auditorium"
    }
  },
  {
    title: "Presentation with Matsuo Lab",
    date: "March 2025",
    place: "Matsuo-Iwasawa Laboratory, UTokyo exchange",
    story:
      "This photo belongs to the UTokyo exchange story: presenting with Matsuo Lab members and turning engineering decisions into a clear research narrative.",
    image: {
      src: "/images/matsuo-presentation.jpg",
      alt: "Duc Doan Sinh presenting with Matsuo Lab"
    }
  },
  {
    title: "Dinner with Prof. Matsuo",
    date: "March 2025",
    place: "Shangri-La Hotel, Tokyo",
    story:
      "A quieter milestone outside the lab: conversations about ambition, standards, and how students can grow into research communities.",
    image: {
      src: "/images/matsuo-dinner.jpg",
      alt: "Dinner with Prof. Matsuo at Shangri-La Hotel"
    }
  },
  {
    title: "Harvard HSIL Hackathon",
    date: "2026",
    place: "Vietnam Hub",
    story:
      "A health innovation sprint that pushed technical work toward user need, impact framing, and crisp communication under pressure.",
    image: {
      src: "/images/harvard-hackathon.jpg",
      alt: "Duc Doan Sinh at Harvard HSIL Hackathon Vietnam Hub"
    }
  }
];

export const photoJourney: JourneyPhoto[] = [
  {
    chapter: "01",
    title: "Standing inside a larger research map",
    caption:
      "Yasuda Auditorium anchors the story: a student from HUST stepping into an international research environment and seeing the scale of the field more clearly.",
    image: {
      src: "/images/yasuda-auditorium.jpg",
      alt: "Duc Doan Sinh at Yasuda Auditorium"
    }
  },
  {
    chapter: "02",
    title: "Turning work into a research narrative",
    caption:
      "The presentation photo is not decoration; it marks the moment where engineering decisions had to become a clear argument.",
    image: {
      src: "/images/matsuo-presentation.jpg",
      alt: "Presentation with Matsuo Lab members"
    }
  },
  {
    chapter: "03",
    title: "Learning through research community",
    caption:
      "Dinner with Prof. Matsuo gives the portfolio a human layer: mentorship, conversation, and the informal spaces where direction becomes clearer.",
    image: {
      src: "/images/matsuo-dinner.jpg",
      alt: "Dinner with Prof. Matsuo"
    }
  },
  {
    chapter: "04",
    title: "Testing ideas in health innovation",
    caption:
      "The hackathon closes the loop from research to impact: technical ideas shaped for healthcare problems, judging, teamwork, and public recognition.",
    image: {
      src: "/images/harvard-hackathon.jpg",
      alt: "Harvard HSIL Hackathon award moment"
    }
  }
];

export const currentWork: TimelineItem[] = [
  {
    year: "Now",
    title: "EDABK Laboratory, HUST",
    place: "AI research",
    description:
      "Researching SNN, KAN, MLP NAS, ECG, PPG, and efficient computer vision systems.",
    icon: BrainCircuit
  },
  {
    year: "Now",
    title: "Viettel Telecom & HANET",
    place: "AI internship",
    description:
      "Working on RAG support assistant design and YOLO deployment optimization for applied AI systems.",
    icon: Rocket
  },
  {
    year: "Now",
    title: "Matsuo-Iwasawa Laboratory",
    place: "Teaching assistant",
    description:
      "Supporting Global Consumer Intelligence coursework, machine learning concepts, and student assignments.",
    icon: MapPinned
  },
  {
    year: "Direction",
    title: "What I want to build next",
    place: "Research and products",
    description:
      "AI systems that connect biomedical signals, embedded deployment, and useful interfaces for real users.",
    icon: HeartPulse
  }
];
