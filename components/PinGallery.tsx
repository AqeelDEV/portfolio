"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BP_DESKTOP, BP_MOBILE, GSAP_EASE, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Desktop (pointer users, motion allowed): pins the section and translates
 * the card track sideways with scroll progress. Mobile and reduced-motion:
 * plain vertical stack with a rise-and-settle entrance per card — the
 * layout switch itself is pure CSS (md:motion-safe: classes on children),
 * this component only attaches the matching choreography.
 */
export default function PinGallery({
  heading,
  children,
}: {
  heading: ReactNode;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current!;
      const track = trackRef.current!;
      const mm = gsap.matchMedia();

      mm.add(
        `${BP_DESKTOP} and ${MOTION_OK}`,
        () => {
          const getDist = () =>
            Math.max(track.scrollWidth - window.innerWidth, 0);

          // cards rise in as the section arrives
          gsap.from(track.children, {
            y: 80,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: GSAP_EASE,
            scrollTrigger: { trigger: wrap, start: "top 75%", once: true },
          });

          // the oversized heading keeps drifting while the section is pinned
          const headingEl = wrap.querySelector("h2");
          if (headingEl) {
            gsap.to(headingEl, {
              xPercent: -8,
              ease: "none",
              scrollTrigger: {
                trigger: wrap,
                start: "top top",
                end: () => `+=${getDist()}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          }

          const tween = gsap.to(track, {
            x: () => -getDist(),
            ease: "none",
            scrollTrigger: {
              trigger: wrap,
              pin: true,
              scrub: 1,
              start: "top top",
              end: () => `+=${getDist()}`,
              invalidateOnRefresh: true,
            },
          });

          // Keep keyboard focus usable inside the pinned range: jump the
          // window to the scroll position that brings the focused card into view.
          const onFocusIn = (e: FocusEvent) => {
            const st = tween.scrollTrigger;
            if (!st) return;
            const cards = Array.from(track.querySelectorAll<HTMLElement>("li"));
            const i = cards.findIndex((c) => c.contains(e.target as Node));
            if (i < 0) return;
            const progress = cards.length > 1 ? i / (cards.length - 1) : 0;
            window.scrollTo({
              top: st.start + progress * (st.end - st.start),
            });
          };
          track.addEventListener("focusin", onFocusIn);
          return () => track.removeEventListener("focusin", onFocusIn);
        }
      );

      mm.add(
        `${BP_MOBILE} and ${MOTION_OK}`,
        () => {
          track.querySelectorAll<HTMLElement>("li").forEach((card) => {
            gsap.from(card, {
              y: 48,
              opacity: 0,
              duration: 0.7,
              ease: GSAP_EASE,
              scrollTrigger: { trigger: card, start: "top 88%", once: true },
            });
          });
        }
      );
    },
    { scope: wrapRef }
  );

  return (
    <div
      ref={wrapRef}
      className="relative md:motion-safe:flex md:motion-safe:h-svh md:motion-safe:flex-col md:motion-safe:justify-center md:motion-safe:overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-6">{heading}</div>
      <ul
        ref={trackRef}
        className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-6 px-6 md:mt-16 md:motion-safe:mx-0 md:motion-safe:w-max md:motion-safe:max-w-none md:motion-safe:flex-row md:motion-safe:items-stretch md:motion-safe:gap-8 md:motion-safe:pl-[calc(max((100vw-80rem)/2,0px)+1.5rem)] md:motion-safe:pr-[12vw]"
      >
        {children}
      </ul>
    </div>
  );
}
