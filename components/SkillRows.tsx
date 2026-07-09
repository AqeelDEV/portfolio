"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SkillCategory } from "@/lib/content";
import { BP_DESKTOP, GSAP_EASE, MOTION_OK } from "@/lib/motion";
import { Text } from "./Todo";

gsap.registerPlugin(ScrollTrigger);

/**
 * Category rows whose chips cascade in as each row scrolls into view, the
 * row itself drifting from alternating sides. Per-row triggers so the list
 * keeps cascading across the whole section instead of firing all at once.
 * Reduced motion: the branch never runs, so nothing is ever hidden.
 */
export default function SkillRows({
  categories,
}: {
  categories: SkillCategory[];
}) {
  const rootRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      mm.add(
        {
          motionOK: MOTION_OK,
          desktop: BP_DESKTOP,
        },
        (ctx) => {
          const { motionOK, desktop } = ctx.conditions!;
          if (!motionOK) return;

          root
            .querySelectorAll<HTMLElement>("[data-skill-row]")
            .forEach((row, i) => {
              gsap.from(row, {
                x: (i % 2 ? 1 : -1) * (desktop ? 64 : 24),
                opacity: 0,
                duration: 0.8,
                ease: GSAP_EASE,
                scrollTrigger: { trigger: row, start: "top 85%", once: true },
              });
              gsap.from(row.querySelectorAll("[data-chip]"), {
                y: 14,
                opacity: 0,
                stagger: 0.035,
                duration: 0.5,
                ease: GSAP_EASE,
                delay: 0.1,
                scrollTrigger: { trigger: row, start: "top 85%", once: true },
              });
            });
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <ul ref={rootRef} className="flex flex-col gap-8 md:gap-10">
      {categories.map((category) => (
        <li
          key={category.label}
          data-skill-row
          className="grid gap-3 md:grid-cols-[14rem_1fr] md:gap-8"
        >
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.25em] text-white/85">
            {category.label}
          </h3>
          <ul className="flex flex-wrap content-start gap-2">
            {category.skills.map((skill, i) => (
              <li
                key={i}
                data-chip
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60"
              >
                <Text value={skill} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
