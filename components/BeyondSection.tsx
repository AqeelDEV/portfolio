import { leadership, spokenLanguages, sports } from "@/lib/content";
import Reveal from "./Reveal";
import BeyondGrid from "./BeyondGrid";

export default function BeyondSection() {
  return (
    <section
      id="beyond"
      aria-labelledby="beyond-heading"
      className="py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-4 text-[0.65rem] uppercase tracking-[0.35em] text-accent/80">
          07 · Beyond the Code
        </p>
        <h2
          id="beyond-heading"
          className="chromatic font-display text-[clamp(2.6rem,9vw,8rem)] font-bold uppercase leading-none tracking-tight text-white"
        >
          <Reveal>Beyond the Code</Reveal>
        </h2>
        <div className="mt-12 md:mt-16">
          <BeyondGrid
            leadership={leadership}
            languages={spokenLanguages}
            sports={sports}
          />
        </div>
      </div>
    </section>
  );
}
