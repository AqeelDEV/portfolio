import AmbientGlow from "@/components/AmbientGlow";
import EnvDriver from "@/components/EnvDriver";
import Hero from "@/components/Hero";
import PositioningStrip from "@/components/PositioningStrip";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import Contact from "@/components/Contact";
import Marquee from "@/components/Marquee";

export default function Home() {
  return (
    <main id="main">
      <AmbientGlow />
      <Hero />
      <EnvDriver />
      <PositioningStrip />
      <Marquee text="Backend — Cloud — Frontend — Applied AI" />
      <ExperienceSection />
      <ProjectsSection />
      <Marquee text="Let's build — Open to FDE internships" />
      <Contact />
    </main>
  );
}
