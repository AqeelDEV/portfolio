"use client";

import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { GSAP_EASE, MOTION_OK, MOTION_REDUCE } from "@/lib/motion";
import { whenIntroDone } from "@/lib/loader";

gsap.registerPlugin(ScrollTrigger, SplitText);

type Props = {
  children: ReactNode;
  className?: string;
  /** seconds; for above-the-fold text that plays on load */
  delay?: number;
  /**
   * false = transform-only settle of the whole element. Required for the
   * LCP element (hero name): a char split swaps in new text nodes after
   * hydration, which re-records the largest text paint and wrecks LCP.
   */
  charSplit?: boolean;
  /**
   * Defer the reveal until the intro preloader exits (hero name/tagline —
   * they'd otherwise play invisibly under the overlay). The tweens are only
   * created then, never hidden early, so the text stays painted for LCP.
   * The gate can't hang: IntroOverlay marks introDone on every path,
   * including skips and failures.
   */
  waitForIntro?: boolean;
};

/**
 * Scroll-triggered reveal. Char/line mask by default; the split is reverted
 * once the animation completes so selection, find-in-page and resize behave
 * as if it never happened. Reduced motion gets a plain fade instead.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  charSplit = true,
  waitForIntro = false,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  // While the split is live, an sr-only twin carries the accessible text
  const [splitting, setSplitting] = useState(false);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current!;
      const start = () => {
        const mm = gsap.matchMedia();

        mm.add(MOTION_OK, () => {
          if (!charSplit) {
            gsap.from(el, {
              y: 16,
              scale: 1.03,
              duration: 1,
              ease: GSAP_EASE,
              delay,
              scrollTrigger: { trigger: el, start: "top 82%", once: true },
            });
            return;
          }

          setSplitting(true);
          const split = SplitText.create(el, {
            type: "lines,chars",
            mask: "lines",
            aria: "none",
          });
          gsap.from(split.chars, {
            yPercent: 110,
            stagger: 0.02,
            duration: 0.8,
            ease: GSAP_EASE,
            delay,
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
            onComplete: () => {
              split.revert();
              setSplitting(false);
            },
          });
          return () => setSplitting(false);
        });

        mm.add(MOTION_REDUCE, () => {
          gsap.from(el, {
            opacity: 0,
            duration: 0.6,
            delay,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
      };

      if (waitForIntro) {
        // Deferred setup must stay inside this component's gsap context so
        // unmount still reverts it; whenIntroDone runs immediately if the
        // intro already finished (or was skipped this session).
        return whenIntroDone(contextSafe!(start));
      }
      start();
    },
    { scope: ref, dependencies: [charSplit, waitForIntro] }
  );

  const label = typeof children === "string" ? children : undefined;

  return (
    <>
      {splitting && label && <span className="sr-only">{label}</span>}
      <span
        ref={ref}
        aria-hidden={splitting && label ? true : undefined}
        className={`block ${className ?? ""}`}
      >
        {children}
      </span>
    </>
  );
}
