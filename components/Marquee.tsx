"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Two rows of oversized outlined display type sliding in opposite
 * directions, driven purely by scroll position. Decorative — the words
 * repeat real keywords, so it's aria-hidden.
 */
export default function Marquee({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const rows = ref.current!.querySelectorAll("[data-row]");
        const st = {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        };
        gsap.fromTo(rows[0], { xPercent: 0 }, { xPercent: -22, ease: "none", scrollTrigger: st });
        gsap.fromTo(rows[1], { xPercent: -22 }, { xPercent: 0, ease: "none", scrollTrigger: { ...st } });
      });
    },
    { scope: ref }
  );

  const row = Array(6).fill(text).join("  —  ");

  // The text lives in pseudo-element content: real enough to paint, but no
  // text node for AT, find-in-page or contrast auditing — it's decoration.
  const rowBase =
    "whitespace-nowrap font-display text-[clamp(2.6rem,7vw,6rem)] font-bold uppercase leading-none tracking-tight before:content-[attr(data-text)]";

  return (
    <div
      ref={ref}
      aria-hidden
      className="select-none overflow-hidden py-14 md:py-20"
    >
      <div data-row data-text={row} className={`text-outline ${rowBase}`} />
      <div data-row data-text={row} className={`text-white/6 ${rowBase}`} />
    </div>
  );
}
