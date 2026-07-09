"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll exit for the hero foreground: the text drifts up and dissolves as
 * the section leaves. Scrubbed transforms only — at scroll 0 nothing is
 * altered, so the LCP paint is untouched.
 */
export default function HeroFx({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(ref.current, {
          yPercent: -24,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current!.parentElement,
            start: "top top",
            end: "bottom 35%",
            scrub: true,
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="relative z-40 flex flex-col items-center">
      {children}
    </div>
  );
}
