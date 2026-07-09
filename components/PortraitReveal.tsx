"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { morph, phase, DOM_HANDOFF_START, DOM_HANDOFF_END } from "@/lib/morph";
import { BP_DESKTOP, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * DOM half of the portal-iris handoff. On desktop the WebGL PortraitAperture
 * opens over this figure, so the real image is held invisible until the
 * handoff window (DOM_HANDOFF_START → 1) and crossfades in as the mesh fades
 * out — the final resting state is the accessible DOM figure, pixel-perfect.
 *
 * Reads morph.progress on the gsap ticker rather than owning a ScrollTrigger:
 * MorphDriver is the single source of truth, and morph.canvasLive is checked
 * live so a canvas that never mounts (no WebGL) degrades to an early fade-in
 * instead of a hole in the layout.
 */
export default function PortraitReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motionOK: MOTION_OK,
          desktop: BP_DESKTOP,
        },
        (ctx) => {
          const { motionOK, desktop } = ctx.conditions!;
          if (!motionOK) return; // reduced motion: figure stays fully visible

          if (!desktop) {
            // No ring on mobile — keep the original scrubbed entrance
            gsap.fromTo(
              ref.current,
              { opacity: 0, scale: 0.94 },
              {
                opacity: 1,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  // resolved against document — selector strings would be
                  // scoped to this wrapper by useGSAP
                  trigger: document.querySelector("#positioning"),
                  start: "top 60%",
                  end: "top 35%",
                  scrub: true,
                },
              }
            );
            return;
          }

          const setOpacity = gsap.quickSetter(ref.current, "opacity");
          let last = -1;
          const tick = () => {
            const o = morph.canvasLive
              ? phase(morph.progress, DOM_HANDOFF_START, DOM_HANDOFF_END)
              : phase(morph.progress, 0.1, 0.45);
            if (o !== last) {
              setOpacity(o);
              last = o;
            }
          };
          gsap.ticker.add(tick);
          tick();
          return () => gsap.ticker.remove(tick);
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
