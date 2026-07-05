import { skillCategories } from "@/lib/content";
import Reveal from "./Reveal";
import SkillRows from "./SkillRows";

// overflow-x-clip: rows drift in from ±64px, which would otherwise widen the
// page and fight Lenis with a horizontal scrollbar mid-animation.
export default function SkillsSection() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="overflow-x-clip py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-4 text-[0.65rem] uppercase tracking-[0.35em] text-accent/80">
          02 — Skills
        </p>
        <h2
          id="skills-heading"
          className="chromatic font-display text-[clamp(2.6rem,9vw,8rem)] font-bold uppercase leading-none tracking-tight text-white"
        >
          <Reveal>Skills</Reveal>
        </h2>
        <div className="mt-12 md:mt-16">
          <SkillRows categories={skillCategories} />
        </div>
      </div>
    </section>
  );
}
