import { site } from "@/lib/content";
import { ACCENT_RGB, ACCENT_2_RGB, MAGENTA_RGB } from "@/lib/palette";
import Reveal from "./Reveal";
import HeroCanvas from "./HeroCanvas";
import HeroFx from "./HeroFx";
import ScrollCue from "./ScrollCue";
import MorphDriver from "./MorphDriver";

export default function Hero() {
  return (
    <section
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Poster gradient — permanent floor under the WebGL canvas, and the
          full fallback when the canvas never mounts (reduced motion / no GL) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            `radial-gradient(60% 50% at 50% 42%, rgba(${ACCENT_RGB}, 0.13), transparent 62%),` +
            `radial-gradient(45% 40% at 63% 58%, rgba(${ACCENT_2_RGB}, 0.11), transparent 65%),` +
            `radial-gradient(35% 35% at 38% 62%, rgba(${MAGENTA_RGB}, 0.06), transparent 70%),` +
            "linear-gradient(180deg, #070708 0%, #0d0e12 100%)",
        }}
      />

      {/* Glass aperture motif — replaced visually by the WebGL scene later */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 size-[min(72vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.03), rgba(255,255,255,0.0) 70%)",
          boxShadow: `inset 0 0 80px rgba(${ACCENT_RGB}, 0.06), 0 0 120px rgba(${ACCENT_2_RGB}, 0.05)`,
        }}
      />

      {/* WebGL fluid + glass aperture — mounts post-idle, sits over the
          poster and under the text */}
      <HeroCanvas />

      {/* Scrubbed progress for the torus → photo frame morph */}
      <MorphDriver />

      <HeroFx>
        <p className="mb-6 text-[0.7rem] uppercase tracking-[0.4em] text-white/50">
          Portfolio
        </p>
        <h1 className="chromatic text-center font-display text-[clamp(3rem,11vw,9.5rem)] font-bold uppercase leading-[0.92] tracking-tight text-white">
          <Reveal delay={0.15} charSplit={false} waitForIntro>
            {site.name}
          </Reveal>
        </h1>
        <p className="mt-8 font-display text-sm font-bold uppercase tracking-[0.45em] text-accent md:text-base">
          <Reveal delay={0.45} charSplit={false} waitForIntro>
            {site.tagline}
          </Reveal>
        </p>
      </HeroFx>

      <ScrollCue />
    </section>
  );
}
