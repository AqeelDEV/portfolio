"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LANGUAGE_LEVEL_LABEL,
  LANGUAGE_LEVEL_PERCENT,
  type LeadershipItem,
  type SpokenLanguage,
  type SportsItem,
} from "@/lib/content";
import { BP_DESKTOP, BP_MOBILE, GSAP_EASE, MOTION_OK } from "@/lib/motion";
import { Text } from "./Todo";

gsap.registerPlugin(ScrollTrigger);

function Tile({
  kicker,
  className,
  children,
}: {
  kicker: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li data-tile className={`glass rounded-3xl p-7 ${className ?? ""}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent/80">
        {kicker}
      </p>
      {children}
    </li>
  );
}

/**
 * Bento grid mixing Leadership, spoken Languages, and Sports. Tiles stagger
 * in (grid-level on desktop, per-tile on mobile); the language meters fill
 * once by animating scaleX from 0 — the final width is inline style, so SSR
 * and reduced motion always show the true level.
 */
export default function BeyondGrid({
  leadership,
  languages,
  sports,
}: {
  leadership: LeadershipItem[];
  languages: SpokenLanguage[];
  sports: SportsItem[];
}) {
  const rootRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      mm.add(`${BP_DESKTOP} and ${MOTION_OK}`, () => {
        gsap.from("[data-tile]", {
          y: 48,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: GSAP_EASE,
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      });

      mm.add(`${BP_MOBILE} and ${MOTION_OK}`, () => {
        root.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile) => {
          gsap.from(tile, {
            y: 48,
            opacity: 0,
            duration: 0.7,
            ease: GSAP_EASE,
            scrollTrigger: { trigger: tile, start: "top 88%", once: true },
          });
        });
      });

      // Meters fill on every width; only reduced motion skips (widths are
      // already final via inline style).
      mm.add(MOTION_OK, () => {
        gsap.from("[data-meter-fill]", {
          scaleX: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: GSAP_EASE,
          scrollTrigger: {
            trigger: root.querySelector("[data-lang-tile]"),
            start: "top 80%",
            once: true,
          },
        });
      });
    },
    { scope: rootRef }
  );

  const [ieee, ...societies] = leadership;

  return (
    <ul ref={rootRef} className="grid grid-cols-1 gap-5 md:grid-cols-6">
      <Tile kicker="Leadership" className="md:col-span-4">
        <h3 className="mt-3 font-display text-xl font-bold leading-tight text-white md:text-2xl">
          <Text value={ieee.org} />
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
          <Text value={ieee.role} />
          <Text value={ieee.dates} />
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          <Text value={ieee.detail} />
        </p>
      </Tile>

      <li
        data-tile
        data-lang-tile
        className="glass rounded-3xl p-7 md:col-span-2 md:row-span-2"
      >
        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent/80">
          Languages
        </p>
        <ul className="mt-5 flex flex-col gap-5">
          {languages.map((lang, i) => (
            <li key={i}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <Text value={lang.name} className="text-white/85" />
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
                  {LANGUAGE_LEVEL_LABEL[lang.level]}
                </span>
              </div>
              <div
                aria-hidden
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  data-meter-fill
                  className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-accent-2"
                  style={{ width: `${LANGUAGE_LEVEL_PERCENT[lang.level]}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </li>

      {societies.map((item, i) => (
        <Tile key={i} kicker="Leadership" className="md:col-span-2">
          <h3 className="mt-3 font-display text-lg font-bold leading-tight text-white">
            <Text value={item.org} />
          </h3>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
            <Text value={item.role} />
            <Text value={item.dates} />
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            <Text value={item.detail} />
          </p>
        </Tile>
      ))}

      {sports.map((item, i) => (
        <Tile key={i} kicker="Sports" className="md:col-span-2">
          <h3 className="mt-3 font-display text-lg font-bold leading-tight text-white">
            <Text value={item.title} />
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            <Text value={item.achievement} />
          </p>
        </Tile>
      ))}
    </ul>
  );
}
