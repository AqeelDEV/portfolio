"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BP_DESKTOP, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Futuristic scroll HUD: a hairline page-progress bar along the top edge and
 * a "01 / 05" section readout in the bottom-left gutter. The bar runs on
 * every route; the section readout is home-page vocabulary (the numbered
 * 01–04 sections), so it's gated to "/" — a work-detail page's Problem/
 * Stack/Impact <section>s must not surface as a page counter. Rebuilt per
 * route (dependencies) so measurements always match the current DOM.
 * Desktop + motion only.
 */
export default function ScrollHUD() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const current = useRef<HTMLSpanElement>(null);
  const total = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${BP_DESKTOP} and ${MOTION_OK}`, () => {
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: true },
          }
        );

        // Section readout: home page only (see JSDoc above)
        if (pathname !== "/") return;

        // resolved against document — useGSAP's scope would confine the
        // selector to this component's own tree
        const sections = Array.from(
          document.querySelectorAll<HTMLElement>("main section")
        );
        if (sections.length < 2) return;

        total.current!.textContent = String(sections.length).padStart(2, "0");
        gsap.set(root.current!.querySelector("[data-counter]"), { autoAlpha: 1 });

        sections.forEach((section, i) => {
          ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
              if (self.isActive && current.current) {
                current.current.textContent = String(i + 1).padStart(2, "0");
              }
            },
          });
        });
      });
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true }
  );

  return (
    <div ref={root} aria-hidden className="max-md:hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-60">
        <div
          ref={bar}
          className="h-0.5 origin-left scale-x-0 bg-gradient-to-r from-accent via-accent-2 to-magenta"
        />
      </div>
      <div
        data-counter
        className="pointer-events-none invisible fixed bottom-6 left-6 z-60 flex items-center gap-2 font-display text-[0.65rem] font-bold tracking-[0.3em] text-white/60 opacity-0"
      >
        <span ref={current} className="text-accent">
          01
        </span>
        <span className="h-px w-6 bg-white/25" />
        <span ref={total}>05</span>
      </div>
    </div>
  );
}
