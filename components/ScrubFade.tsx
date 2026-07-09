"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scrubbed entrance: children resolve from `from` to their natural state
 * across a scroll window. Reduced motion never applies `from`, so content
 * stays fully visible.
 */
export default function ScrubFade({
  children,
  className,
  from = { opacity: 0, y: 32 },
  start = "top 85%",
  end = "top 45%",
  trigger,
}: {
  children: ReactNode;
  className?: string;
  from?: gsap.TweenVars;
  start?: string;
  end?: string;
  /** Selector for an external trigger element; defaults to the wrapper. */
  trigger?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(ref.current, from, {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            // useGSAP's scope makes selector strings resolve inside the
            // wrapper — external triggers must be resolved against document
            trigger: (trigger && document.querySelector(trigger)) || ref.current,
            start,
            end,
            scrub: true,
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
