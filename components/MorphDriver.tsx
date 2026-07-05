"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { morph, MORPH_TARGET_SELECTOR } from "@/lib/morph";
import { BP_DESKTOP, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Writes the torus→frame morph progress. A bare trigger, no tween: Lenis
 * already low-passes the scroll and the scene damps the value again, so a
 * scrub tween would only add a second source of truth. Mounts at hydration —
 * long before the canvas does — so progress is correct on reload-mid-page.
 */
export default function MorphDriver() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        motionOK: MOTION_OK,
        desktop: BP_DESKTOP,
      },
      (ctx) => {
        const { motionOK, desktop } = ctx.conditions!;
        if (!motionOK || !desktop) return;

        const st = ScrollTrigger.create({
          trigger: "#positioning",
          start: "top bottom",
          endTrigger: MORPH_TARGET_SELECTOR,
          end: "center 50%",
          onUpdate: (self) => {
            morph.progress = self.progress;
          },
          onRefresh: (self) => {
            morph.progress = self.progress;
          },
        });

        return () => {
          st.kill();
          morph.progress = 0;
        };
      }
    );
  });

  return null;
}
