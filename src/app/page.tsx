import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Highlight } from "@/components/sections/Highlight";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";
import { Recognition } from "@/components/sections/Recognition";
import { Contact } from "@/components/sections/Contact";

/**
 * Section order (the "8 sections"):
 *   1. Hero          — staggered load animation
 *   2. About         — editorial manifesto + portrait
 *   3. Work          — selected projects (Problem→Built→Learned→Why), tilt + parallax
 *   4. Highlight     — pinned, horizontal-scroll flagship deep-dive
 *   5. Capabilities  — AI + Embedded stack matrix
 *   6. Experience    — what I'm building now
 *   7. Recognition   — awards & signals
 *   8. Contact       — closing call to action
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Highlight />
      <Capabilities />
      <Experience />
      <Recognition />
      <Contact />
    </>
  );
}
