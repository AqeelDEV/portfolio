"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { env, BELOW_RAMP } from "@/lib/env";
import { BP_DESKTOP, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Writes the ambient environment state (lib/env.ts). Bare triggers, no
 * tweens — same rationale as MorphDriver: Lenis low-passes the scroll and
 * the scene damps the values again. Desktop + motion-safe only: the canvas
 * is hero-scoped on mobile and never mounts under reduced motion.
 */
export default function EnvDriver() {
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

        const page = ScrollTrigger.create({
          trigger: "#main",
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            env.pageProgress = self.progress;
          },
          onRefresh: (self) => {
            env.pageProgress = self.progress;
          },
        });

        // ASSUMES nothing is pinned above #work. The window is measured from
        // the #work section's top, which is only stable because every pin
        // (PinGallery) lives *inside* its section — a pin-spacer inserted
        // above #work would silently shift these start/end positions. If the
        // page is ever restructured with a pinned section before Experience,
        // re-derive BELOW_RAMP in lib/env.ts.
        const below = ScrollTrigger.create({
          trigger: BELOW_RAMP.trigger,
          start: BELOW_RAMP.start,
          end: BELOW_RAMP.end,
          onUpdate: (self) => {
            env.below = self.progress;
          },
          onRefresh: (self) => {
            env.below = self.progress;
          },
        });

        return () => {
          page.kill();
          below.kill();
          env.pageProgress = 0;
          env.below = 0;
        };
      }
    );
  });

  return null;
}
