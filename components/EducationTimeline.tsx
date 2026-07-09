"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { EducationEntry } from "@/lib/content";
import { GSAP_EASE, MOTION_OK } from "@/lib/motion";
import { Text } from "./Todo";

gsap.registerPlugin(ScrollTrigger);

/**
 * Vertical timeline whose spine draws itself with scroll (scrubbed) while
 * each milestone's node pops and its content rises in once. The line ships
 * fully drawn in markup — GSAP owns the hidden state only inside the motion
 * branch, so SSR and reduced motion always show the complete timeline.
 */
export default function EducationTimeline({
  entries,
}: {
  entries: EducationEntry[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      // Same choreography on every width — the column is single on mobile too.
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 75%",
              end: "bottom 55%",
              scrub: true,
            },
          }
        );

        root
          .querySelectorAll<HTMLElement>("[data-milestone]")
          .forEach((li) => {
            gsap.from(li.querySelector("[data-node]"), {
              scale: 0,
              duration: 0.5,
              ease: "back.out(2)",
              scrollTrigger: { trigger: li, start: "top 80%", once: true },
            });
            gsap.from(li.querySelector("[data-entry]"), {
              y: 24,
              opacity: 0,
              duration: 0.7,
              ease: GSAP_EASE,
              scrollTrigger: { trigger: li, start: "top 80%", once: true },
            });
          });
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative max-w-3xl">
      <div
        aria-hidden
        data-line
        className="absolute bottom-1 left-[7px] top-1 w-px origin-top bg-gradient-to-b from-accent via-accent-2 to-magenta"
      />
      <ol>
        {entries.map((entry) => (
          <li
            key={entry.slug}
            data-milestone
            className="relative pl-10 pb-14 last:pb-0"
          >
            <span
              aria-hidden
              data-node
              className="absolute left-0 top-1 size-[15px] rounded-full border-2 border-accent bg-ink shadow-[0_0_14px_rgba(40,224,208,0.5)]"
            />
            <div data-entry>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
                <Text value={entry.dates} />
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white md:text-3xl">
                <Text value={entry.institution} />
              </h3>
              <p className="mt-1 text-sm text-accent/90">
                <Text value={entry.credential} />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                <Text value={entry.detail} />
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {entry.highlights.map((line, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-white/65">
                    <span aria-hidden className="text-accent">
                      →
                    </span>
                    <Text value={line} />
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
