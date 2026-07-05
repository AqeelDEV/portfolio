"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BP_DESKTOP, MOTION_OK } from "@/lib/motion";

/**
 * Magnetic hover: the child eases toward the cursor while hovered and springs
 * back on leave. Wraps its child in an inline-block div — apply it to compact
 * elements (nav pills, CTAs), not large blocks. Desktop fine-pointers only.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "inline-block",
}: {
  children: ReactNode;
  /** Fraction of the cursor's offset from center the element follows. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(
        `${BP_DESKTOP} and (pointer: fine) and ${MOTION_OK}`,
        () => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * strength);
            yTo((e.clientY - (r.top + r.height / 2)) * strength);
          };
          const leave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
          };

          el.addEventListener("mousemove", move);
          el.addEventListener("mouseleave", leave);
          return () => {
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
          };
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
