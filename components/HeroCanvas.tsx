"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BP_DESKTOP, MOTION_REDUCE } from "@/lib/motion";

// three/r3f live in their own chunk — loaded only when we decide to mount
const Scene = dynamic(() => import("./HeroCanvasInner"), { ssr: false });

/**
 * Gatekeeper for the WebGL hero. Mounts the scene only after the browser is
 * idle (first paint is long done), and never under reduced motion or without
 * WebGL — the CSS poster behind it simply stays.
 *
 * On md+ the wrapper is fixed and raised above section content (z-30, under
 * the z-40 hero text and z-50 nav) so the glass torus can travel down and
 * dock onto the About photo frame. The wrapper can't be click-through-blocked
 * (`pointer-events-none`); the scene reads the pointer from document.body.
 *
 * Desktop keeps the render loop alive page-wide: below the fold the scene is
 * just the dim star residual (fluid and ring cull themselves), so the frame
 * cost is a couple of draw calls plus the useFrame damping — an accepted
 * 1–2ms/frame budget on weak machines. On mobile the canvas is hero-scoped,
 * so the loop is frozen + hidden via an IntersectionObserver on the hero.
 *
 * The breakpoint is tracked live (matchMedia change listener), and crossing
 * it remounts the scene via the key below — the scene's own desktop/mobile
 * branches (ring presence, particle count) are read once per mount, so a
 * stale-branch scene must never survive a resize across 768px. MorphDriver's
 * cleanup zeroes morph.progress on the same crossing; a fresh scene mount
 * snaps to that cleanly instead of animating an un-morph.
 */
const subscribeDesktop = (onChange: () => void) => {
  const mq = window.matchMedia(BP_DESKTOP);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const readDesktop = () => window.matchMedia(BP_DESKTOP).matches;

export default function HeroCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Mobile-only signal from the IntersectionObserver; desktop derives
  // `active` without it (page-wide loop, see JSDoc).
  const [ioActive, setIoActive] = useState(true);
  // Live breakpoint — a change remounts the scene (key below) so the
  // scene's mount-time desktop/mobile branches can never go stale.
  const desktop = useSyncExternalStore(subscribeDesktop, readDesktop, () => false);

  useEffect(() => {
    if (window.matchMedia(MOTION_REDUCE).matches) return;

    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setMounted(true), { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Mobile: canvas is hero-scoped — freeze the loop once the hero is gone.
  // Desktop never registers the observer; its loop is page-wide by design.
  useEffect(() => {
    const el = ref.current;
    if (!el || !mounted || desktop) return;

    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
        setIoActive([...visible.values()].some(Boolean));
      },
      { threshold: 0, rootMargin: "100px" }
    );
    if (el.parentElement) io.observe(el.parentElement);
    return () => io.disconnect();
  }, [mounted, desktop]);

  const active = desktop || ioActive;

  return (
    <div
      ref={ref}
      aria-hidden
      data-ready={mounted}
      data-active={active}
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-1000 data-[active=false]:invisible data-[ready=true]:opacity-100 md:fixed md:z-30"
    >
      {mounted && <Scene key={desktop ? "desktop" : "mobile"} active={active} />}
    </div>
  );
}
