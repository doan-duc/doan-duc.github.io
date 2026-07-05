import { Hero3D } from "@/components/sections/Hero3D";
import { About3D } from "@/components/sections/About3D";
import { FeaturedResearch3D } from "@/components/sections/FeaturedResearch3D";
import { Projects3D } from "@/components/sections/Projects3D";
import { Skills3D } from "@/components/sections/Skills3D";
import { Achievements3D } from "@/components/sections/Achievements3D";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero3D />
      <About3D />
      <FeaturedResearch3D />
      <Projects3D />
      <Skills3D />
      <Achievements3D />
      <Contact />
    </>
  );
}
