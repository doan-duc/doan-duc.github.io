"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const chapters = [
  { id: "home", label: "Origin" },
  { id: "about", label: "Story" },
  { id: "highlights", label: "Signals" },
  { id: "projects", label: "Work" },
  { id: "awards", label: "Awards" },
  { id: "experience", label: "Journey" },
  { id: "now", label: "Now" },
  { id: "contact", label: "Contact" }
];

export function ScrollFlowRail() {
  const [active, setActive] = useState(chapters[0].id);
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 130, damping: 28 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: 0.01 }
    );

    chapters.forEach((chapter) => {
      const element = document.getElementById(chapter.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="scroll-flow-rail" aria-label="Scroll chapters">
      <div className="scroll-flow-track" aria-hidden="true">
        <motion.span className="scroll-flow-progress" style={{ scaleY }} />
      </div>

      <nav className="scroll-flow-nav">
        {chapters.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className={active === chapter.id ? "is-active" : undefined}
            aria-label={`Go to ${chapter.label}`}
          >
            <span className="scroll-flow-dot" />
            <span className="scroll-flow-label">
              {String(index + 1).padStart(2, "0")} / {chapter.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
