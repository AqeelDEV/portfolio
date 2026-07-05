import { education } from "@/lib/content";
import Reveal from "./Reveal";
import EducationTimeline from "./EducationTimeline";

export default function EducationSection() {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-4 text-[0.65rem] uppercase tracking-[0.35em] text-accent/80">
          05 — Education
        </p>
        <h2
          id="education-heading"
          className="chromatic font-display text-[clamp(2.6rem,9vw,8rem)] font-bold uppercase leading-none tracking-tight text-white"
        >
          <Reveal>Education</Reveal>
        </h2>
        <div className="mt-12 md:mt-16">
          <EducationTimeline entries={education} />
        </div>
      </div>
    </section>
  );
}
