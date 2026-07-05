"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_REDUCE } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<RefObject<Lenis | null>>({ current: null });

/**
 * Ref to the Lenis instance — read `.current` at event time. Stays null
 * under reduced motion, where native scroll is the correct behaviour.
 */
export const useLenisRef = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Reduced motion: keep native scroll. ScrollTrigger still works on it.
    if (window.matchMedia(MOTION_REDUCE).matches) return;

    const instance = new Lenis({ autoRaf: false, lerp: 0.1 });
    instance.on("scroll", ScrollTrigger.update);

    // gsap ticker reports seconds; lenis.raf wants milliseconds
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    // Lenis owns frame timing — stop gsap from compensating for lag spikes
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;

    // Pin distances depend on final layout — recompute once images are in
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
