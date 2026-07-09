import Image from "next/image";
import { site, isTodo } from "@/lib/content";
import { Todo } from "./Todo";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import ScrubFade from "./ScrubFade";
import PortraitReveal from "./PortraitReveal";

export default function PositioningStrip() {
  return (
    <section
      id="positioning"
      aria-labelledby="positioning-heading"
      className="relative mx-auto max-w-7xl px-6 py-28 md:py-44"
    >
      <div className="grid items-center gap-14 md:grid-cols-[3fr_2fr]">
        <ScrubFade trigger="#positioning" start="top 70%" end="top 30%">
          <p className="mb-5 text-[0.65rem] uppercase tracking-[0.35em] text-accent/80">
            01 · About
          </p>
          <h2
            id="positioning-heading"
            className="font-display text-[clamp(1.9rem,5vw,4.2rem)] font-bold uppercase leading-[1.04] tracking-tight text-white"
          >
            <Reveal>{site.oneLiner}</Reveal>
          </h2>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/50">
            {isTodo(site.location) ? <Todo value={site.location} /> : site.location}
          </p>
        </ScrubFade>

        <Parallax y={40} className="mx-auto w-full max-w-sm">
          {/* data-morph-target: the hero torus measures this figure's rect
              every frame and docks onto it. All reveal animation lives on the
              inner PortraitReveal div so the measured rect stays stable. */}
          <figure data-morph-target className="glass rounded-full p-2.5">
            <PortraitReveal>
              <div className="relative aspect-square overflow-hidden rounded-full">
                <Image
                  src={site.photo}
                  alt={`Portrait of ${site.name}`}
                  fill
                  sizes="(min-width: 768px) 24rem, 90vw"
                  className="object-cover grayscale contrast-110"
                />
                {/* Duotone map: highlights take the cyan → violet gradient,
                    shadows stay ink — reads as a design element, not a mugshot */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-br from-accent via-accent-2 to-magenta mix-blend-multiply"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent"
                />
              </div>
            </PortraitReveal>
          </figure>
        </Parallax>
      </div>
    </section>
  );
}
