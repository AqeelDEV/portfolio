"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Certification } from "@/lib/content";
import { BP_DESKTOP, BP_MOBILE, GSAP_EASE, MOTION_OK } from "@/lib/motion";
import { Text } from "./Todo";

gsap.registerPlugin(ScrollTrigger);

/**
 * Glass certification cards. Desktop: one grid-level staggered rise. Mobile:
 * per-card triggers — the single column is tall enough that a grid-level
 * stagger would fire for cards still below the fold (the PinGallery idiom).
 * The "In progress" pulse is pure CSS (badge-pulse in globals.css) behind
 * motion-safe:, so reduced motion stills it without any JS.
 */
export default function CertificationsGrid({
  items,
}: {
  items: Certification[];
}) {
  const rootRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      mm.add(`${BP_DESKTOP} and ${MOTION_OK}`, () => {
        gsap.from("[data-cert]", {
          y: 56,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: GSAP_EASE,
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      });

      mm.add(`${BP_MOBILE} and ${MOTION_OK}`, () => {
        root.querySelectorAll<HTMLElement>("[data-cert]").forEach((card) => {
          gsap.from(card, {
            y: 48,
            opacity: 0,
            duration: 0.7,
            ease: GSAP_EASE,
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          });
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <ul ref={rootRef} className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.slug}
          data-cert
          className="glass relative flex flex-col gap-4 overflow-hidden rounded-3xl p-7 md:p-9"
        >
          {/* top edge highlight — sells the glass */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />

          <div className="flex items-baseline justify-between gap-4 text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
            <Text value={item.issuer} />
            <Text value={item.date} />
          </div>

          <h3 className="font-display text-xl font-bold leading-tight text-white md:text-2xl">
            <Text value={item.title} />
          </h3>

          <p className="text-sm leading-relaxed text-white/70">
            <Text value={item.detail} />
          </p>

          {item.inProgress && (
            <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-accent">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-accent motion-safe:animate-[badge-pulse_2.4s_ease-in-out_infinite]"
              />
              In progress
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
