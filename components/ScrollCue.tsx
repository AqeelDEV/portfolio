"use client";

import { useLenisRef } from "./SmoothScroll";

export default function ScrollCue() {
  const lenisRef = useLenisRef();

  return (
    <a
      href="#positioning"
      onClick={(e) => {
        // Lenis is null under reduced motion — the native anchor jump is
        // exactly the right behaviour there.
        const lenis = lenisRef.current;
        if (lenis) {
          e.preventDefault();
          lenis.scrollTo("#positioning", { duration: 1.2 });
        }
      }}
      className="group absolute bottom-10 z-40 flex flex-col items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
    >
      Scroll
      <span
        aria-hidden
        className="block h-10 w-px bg-gradient-to-b from-white/60 to-transparent motion-safe:animate-pulse"
      />
    </a>
  );
}
