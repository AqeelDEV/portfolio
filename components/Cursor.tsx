"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BP_DESKTOP, MOTION_OK } from "@/lib/motion";

/**
 * Custom cursor accent: a fast dot and a lagging ring in mix-blend-difference.
 * The ring grows over interactive elements and becomes a "VIEW" badge over
 * elements tagged data-cursor="view" (work cards). The native cursor is kept —
 * this is an accent layer, not a replacement, so nothing breaks if it dies.
 * Desktop fine-pointers with motion only.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        `${BP_DESKTOP} and (pointer: fine) and ${MOTION_OK}`,
        () => {
          const d = dot.current!;
          const r = ring.current!;
          const l = label.current!;
          gsap.set([d, r], { xPercent: -50, yPercent: -50 });

          const dx = gsap.quickTo(d, "x", { duration: 0.15, ease: "power2.out" });
          const dy = gsap.quickTo(d, "y", { duration: 0.15, ease: "power2.out" });
          const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3.out" });
          const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3.out" });
          // quickTo can't retarget the two-property "scale" alias — use a
          // self-overwriting tween instead
          const rScale = (v: number) =>
            gsap.to(r, { scale: v, duration: 0.3, ease: "power2.out", overwrite: "auto" });

          let shown = false;
          const move = (e: PointerEvent) => {
            if (!shown) {
              shown = true;
              gsap.set([d, r], { x: e.clientX, y: e.clientY });
              gsap.to([d, r], { opacity: 1, duration: 0.3 });
            }
            dx(e.clientX);
            dy(e.clientY);
            rx(e.clientX);
            ry(e.clientY);
          };

          const over = (e: PointerEvent) => {
            const t = (e.target as Element).closest?.("a, button, [data-cursor]");
            if (!t) {
              rScale(1);
              gsap.to(l, { opacity: 0, duration: 0.15 });
              gsap.to(d, { opacity: 1, duration: 0.15 });
            } else if (t.getAttribute("data-cursor") === "view") {
              rScale(2.6);
              gsap.to(l, { opacity: 1, duration: 0.2 });
              gsap.to(d, { opacity: 0, duration: 0.15 });
            } else {
              rScale(1.7);
              gsap.to(l, { opacity: 0, duration: 0.15 });
              gsap.to(d, { opacity: 1, duration: 0.15 });
            }
          };

          const hide = () => {
            shown = false;
            gsap.to([d, r], { opacity: 0, duration: 0.2 });
          };

          window.addEventListener("pointermove", move, { passive: true });
          document.addEventListener("pointerover", over);
          document.documentElement.addEventListener("pointerleave", hide);
          return () => {
            window.removeEventListener("pointermove", move);
            document.removeEventListener("pointerover", over);
            document.documentElement.removeEventListener("pointerleave", hide);
          };
        }
      );
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-80 mix-blend-difference max-md:hidden"
    >
      <div
        ref={ring}
        className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-full border border-white/70 opacity-0"
      >
        <span
          ref={label}
          className="text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-white opacity-0"
        >
          View
        </span>
      </div>
      <div ref={dot} className="absolute left-0 top-0 size-1.5 rounded-full bg-white opacity-0" />
    </div>
  );
}
