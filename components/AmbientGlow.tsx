"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_SELECTORS, SECTION_ACTIVE } from "@/lib/env";
import { MOTION_OK, MOTION_REDUCE } from "@/lib/motion";
import { ACCENT_RGB, ACCENT_2_RGB, MAGENTA_RGB } from "@/lib/palette";

gsap.registerPlugin(ScrollTrigger);

type Orb = { x?: string; y?: string; opacity: number };
type Palette = { cyan: Orb; violet: Orb; magenta: Orb };

// Discrete per-section palettes rather than continuous interpolation: with
// Marquee strips between sections there is no meaningful anchor to blend
// across, and a 1.4s crossfade at each boundary reads smoother than a scrub.
// Opacities cap at 0.09 — the glow is atmosphere, never a subject.
const STATES: Record<string, Palette> = {
  hero: {
    cyan: { opacity: 0 },
    violet: { opacity: 0 },
    magenta: { opacity: 0 },
  },
  about: {
    cyan: { x: "18vw", y: "-22vh", opacity: 0.09 },
    violet: { x: "-30vw", y: "25vh", opacity: 0.04 },
    magenta: { opacity: 0 },
  },
  work: {
    cyan: { x: "26vw", y: "30vh", opacity: 0.03 },
    violet: { x: "-20vw", y: "-12vh", opacity: 0.09 },
    magenta: { x: "25vw", y: "-30vh", opacity: 0.02 },
  },
  projects: {
    cyan: { opacity: 0 },
    violet: { x: "-26vw", y: "20vh", opacity: 0.04 },
    magenta: { x: "20vw", y: "-14vh", opacity: 0.08 },
  },
  contact: {
    cyan: { x: "0vw", y: "20vh", opacity: 0.09 },
    violet: { x: "28vw", y: "-24vh", opacity: 0.02 },
    magenta: { x: "-24vw", y: "-18vh", opacity: 0.03 },
  },
};

// Selectors and the active window come from lib/env.ts — the same source
// EnvDriver's below-fold ramp is anchored to, so the palette shifts and the
// WebGL recovery can't drift apart when boundaries are tuned.
const SECTIONS: [selector: string, state: keyof typeof STATES][] = [
  [SECTION_SELECTORS.about, "about"],
  [SECTION_SELECTORS.work, "work"],
  [SECTION_SELECTORS.projects, "projects"],
  [SECTION_SELECTORS.contact, "contact"],
];

/**
 * Page-wide ambient depth: three fixed glow orbs behind all content that
 * drift to a new corner and colour as each section becomes active. Bare
 * ScrollTriggers fire discrete state changes (last-writer-wins covers the
 * Marquee gaps); the orbs themselves only ever tween transform + opacity.
 *
 * Mounted from app/page.tsx, NOT the root layout: the section ids only exist
 * on the home page, and a layout-mounted instance would keep triggers bound
 * to detached nodes after a client navigation to /work/[slug] and back.
 */
export default function AmbientGlow() {
  const cyanRef = useRef<HTMLDivElement>(null);
  const violetRef = useRef<HTMLDivElement>(null);
  const magentaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const orbs = {
      cyan: cyanRef.current,
      violet: violetRef.current,
      magenta: magentaRef.current,
    };
    const mm = gsap.matchMedia();

    // All widths: the glow is the only ambient layer on mobile, where the
    // WebGL canvas stays confined to the hero.
    mm.add(MOTION_OK, () => {
      const apply = (name: keyof typeof STATES) => {
        for (const key of ["cyan", "violet", "magenta"] as const) {
          gsap.to(orbs[key], {
            ...STATES[name][key],
            duration: 1.4,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        }
      };

      const triggers = SECTIONS.map(([selector, name]) =>
        ScrollTrigger.create({
          trigger: selector,
          start: SECTION_ACTIVE.start,
          end: SECTION_ACTIVE.end,
          onEnter: () => apply(name),
          onEnterBack: () => apply(name),
          // Above the first section the hero owns the atmosphere
          ...(name === "about" && { onLeaveBack: () => apply("hero") }),
        })
      );

      return () => triggers.forEach((t) => t.kill());
    });

    // Reduced motion: one static, quieter arrangement — no triggers, no
    // shifting. This branch also serves visitors who never get the canvas.
    mm.add(MOTION_REDUCE, () => {
      const all = [orbs.cyan, orbs.violet, orbs.magenta];
      // A mid-session OS toggle can leave palette tweens in flight: they're
      // created inside ScrollTrigger callbacks, after the matchMedia context
      // finished executing, so the motion branch's revert never captures or
      // kills them. Stop them explicitly, then pin the full static
      // arrangement — magenta included, or it stays frozen at whatever the
      // last section state left it.
      gsap.killTweensOf(all);
      gsap.set(orbs.cyan, { x: "22vw", y: "-24vh", opacity: 0.06 });
      gsap.set(orbs.violet, { x: "-26vw", y: "22vh", opacity: 0.03 });
      gsap.set(orbs.magenta, { x: 0, y: 0, opacity: 0 });
    });
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[1]">
      <div
        ref={cyanRef}
        className="glow-orb"
        style={{ "--orb-color": `rgba(${ACCENT_RGB}, 0.9)` } as CSSProperties}
      />
      <div
        ref={violetRef}
        className="glow-orb"
        style={{ "--orb-color": `rgba(${ACCENT_2_RGB}, 0.9)` } as CSSProperties}
      />
      <div
        ref={magentaRef}
        className="glow-orb"
        style={{ "--orb-color": `rgba(${MAGENTA_RGB}, 0.9)` } as CSSProperties}
      />
    </div>
  );
}
