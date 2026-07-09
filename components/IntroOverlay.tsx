"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MOTION_OK, MOTION_REDUCE } from "@/lib/motion";
import { ACCENT_RGB, ACCENT_2_RGB, MAGENTA_RGB } from "@/lib/palette";
import { loader, markIntroDone, subscribeLoader } from "@/lib/loader";
import { useLenisRef } from "./SmoothScroll";

const SESSION_KEY = "aj:intro";
/** The choreography always plays out, even on an instant load. */
const MIN_CHOREOGRAPHY = 2.2;
/** Assets never hold the door longer than this. */
const HARD_CAP = 4.0;
/** Independent of GSAP — must outlive the worst healthy exit (cap + iris ≈ 5.3s). */
const FAILSAFE_MS = 6000;

// Dot geometry in viewBox units. The dot and its halo animate via the r
// attribute — SVG transform origins and CSS blur filters on SVG elements
// are unreliable across renderers, radii and gradients are not.
const DOT_R = 7;
const GLOW_R = 22;

const IRIS_MS = 900;
const IRIS_DELAY_MS = 150;
/** power3.inOut, applied by hand so the iris rAF owes nothing to GSAP. */
const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

// Centerline letterforms for the draw-on. pathLength=1 normalizes every
// path so the CSS hidden state (globals.css) and the dashoffset tweens
// need no getTotalLength() measuring.
const PATHS = [
  { cls: "p-a1", d: "M 26 96 L 60 24 L 94 96" }, // A diagonals, one stroke
  { cls: "p-a2", d: "M 42 66 L 78 66" }, // A crossbar
  { cls: "p-j", d: "M 148 24 V 70 Q 148 96 125 96 Q 110 96 106 83" }, // J
] as const;

const Strokes = () => (
  <>
    {PATHS.map((p) => (
      <path key={p.cls} className={p.cls} pathLength={1} d={p.d} />
    ))}
  </>
);

/**
 * Branded preloader: the "AJ." monogram draws on as glowing strokes with
 * chromatic echoes, floods to white, the accent dot pops — then a circular
 * iris expands from the dot to reveal the site (the same lens/aperture motif
 * as the hero's portrait handoff). Plays once per browser session; a
 * pre-paint script in layout.tsx hides it before first paint on repeats.
 *
 * The exit waits for the hero's 3D assets (lib/loader.ts) but can never trap
 * the page: min 2.2s of choreography, 4s asset cap, a 6s plain-setTimeout
 * failsafe armed before any animation code runs, and a pure-CSS fade at 7s
 * for the hydration-never-happened case (globals.css).
 */
export default function IntroOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const lenisRef = useLenisRef();
  // Mutable per-instance state shared across effects and GSAP callbacks —
  // survives StrictMode re-runs, never triggers renders.
  const stateRef = useRef({
    dismissed: false,
    failsafe: 0,
    cleanups: [] as (() => void)[],
  });

  /** Idempotent teardown — every path out of the intro funnels through here. */
  const dismiss = () => {
    const s = stateRef.current;
    if (s.dismissed) return;
    s.dismissed = true;
    window.clearTimeout(s.failsafe);
    for (const fn of s.cleanups.splice(0)) {
      try {
        fn();
      } catch {}
    }
    markIntroDone(); // opens the gated hero reveals on every path
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    document.documentElement.style.overflow = "";
    lenisRef.current?.start();
    setGone(true);
  };
  // Latest-closure ref for the async callers (failsafe timeout, GSAP
  // onComplete, iris rAF) — they all fire well after render, so refreshing
  // it in a layout effect rather than during render is safe and keeps React
  // happy about not mutating refs mid-render.
  const dismissRef = useRef(dismiss);
  useLayoutEffect(() => {
    dismissRef.current = dismiss;
  });

  // Declared BEFORE useGSAP so it runs first: the failsafe must be armed
  // before any animation code that could throw.
  useLayoutEffect(() => {
    const s = stateRef.current;
    s.failsafe = window.setTimeout(() => dismissRef.current(), FAILSAFE_MS);

    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SESSION_KEY);
    } catch {}

    // Slow hydration can lose the race to the pure-CSS 7s escape hatch
    // (globals.css): its clock runs from first paint, ours from hydration, so
    // if the fallback has already started fading the overlay the page is
    // revealed. Re-locking scroll now would freeze a page the visitor can
    // already see and scroll — detect it (opacity < 1) and bail like a skip.
    const root = rootRef.current;
    const faded = !!root && parseFloat(getComputedStyle(root).opacity) < 1;

    if (seen || faded) {
      // Repeat visit (the pre-paint CSS already hid us) or the fallback beat
      // hydration — either way, unmount and open the reveal gate without
      // ceremony, and never lock scroll.
      s.dismissed = true;
      window.clearTimeout(s.failsafe);
      markIntroDone();
      // The fallback path hasn't recorded the visit; do it so the next load
      // skips cleanly via the pre-paint script.
      if (faded) {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
      }
      setGone(true);
      return;
    }

    document.documentElement.style.overflow = "hidden";
    lenisRef.current?.stop(); // usually still null here — SmoothScroll creates Lenis stopped instead
    return () => {
      window.clearTimeout(s.failsafe);
      document.documentElement.style.overflow = "";
      // Symmetric teardown: dismiss() is the only other place that restarts
      // Lenis, so an unmount before it runs must undo the scroll lock itself
      // or smooth scroll stays dead. Idempotent — a no-op after a clean exit.
      // Reading .current at cleanup is deliberate: SmoothScroll creates the
      // instance after this effect, so a captured copy would be stale/null.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      lenisRef.current?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    (_, contextSafe) => {
      const s = stateRef.current;
      const root = rootRef.current;
      if (s.dismissed || !root || !contextSafe) return;
      const q = gsap.utils.selector(root);

      try {
        const mm = gsap.matchMedia();

        mm.add(MOTION_REDUCE, () => {
          // Static lockup, brief hold, plain fade — and never waits on the
          // canvas (it doesn't mount under reduced motion).
          gsap.set(q("[data-echo-m], [data-echo-v], [data-track]"), { opacity: 0 });
          gsap.set(q("[data-main] path"), { strokeDashoffset: 0 });
          gsap.set(q("[data-main]"), { opacity: 0.3 });
          gsap.set(q("#intro-flood rect"), { attr: { y: 0 } });
          gsap.set(q("[data-dot]"), { attr: { r: DOT_R } });
          gsap.set(q("[data-glow]"), { opacity: 1 });
          const tl = gsap.timeline({ onComplete: () => dismissRef.current() });
          tl.fromTo(
            q("[data-intro-content]"),
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
          ).to(
            root,
            { opacity: 0, duration: 0.5, onStart: markIntroDone },
            "+=0.6"
          );
          s.cleanups.push(() => tl.kill());
        });

        mm.add(MOTION_OK, () => {
          // ── Main choreography ─────────────────────────────────────────
          const tl = gsap.timeline();
          tl.to(q("[data-glow]"), { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }, 0);
          tl.to(q("[data-track]"), { opacity: 1, duration: 0.3, ease: "power2.out" }, 0);

          // Each stroke: the accent main leads, the chromatic echoes trail
          const draw = (cls: string, at: number, dur: number, ease = "power2.inOut") => {
            tl.to(q(`[data-main] .${cls}`), { strokeDashoffset: 0, duration: dur, ease }, at);
            tl.to(q(`[data-echo-v] .${cls}`), { strokeDashoffset: 0, duration: dur, ease }, at + 0.06);
            tl.to(q(`[data-echo-m] .${cls}`), { strokeDashoffset: 0, duration: dur, ease }, at + 0.12);
          };
          draw("p-a1", 0.2, 0.55);
          draw("p-a2", 0.55, 0.3, "power2.out");
          draw("p-j", 0.45, 0.5);

          // Aberration resolves — echoes slide home and vanish
          tl.to(q("[data-echo-m], [data-echo-v]"), { x: 0, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.9);
          // Fill flood: the white wide-stroke twin rises bottom-to-top
          tl.to(q("#intro-flood rect"), { attr: { y: 0 }, duration: 0.4, ease: "power2.inOut" }, 1.3);
          tl.to(q("[data-main]"), { opacity: 0.3, duration: 0.4, ease: "power2.inOut" }, 1.3);
          // The accent dot lands. Radius (not transform) animation on purpose:
          // SVG transform origins are unreliable across renderers.
          tl.to(q("[data-dot]"), { attr: { r: DOT_R }, duration: 0.45, ease: "back.out(2.2)" }, 1.35);

          // Holding pattern while assets finish — killed at exit
          const pulse = gsap.to(q("[data-dot]"), {
            attr: { r: DOT_R * 1.12 }, duration: 0.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.8,
          });
          const pulseGlow = gsap.to(q("[data-dot-glow]"), {
            opacity: 0.35, duration: 0.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.8,
          });

          // ── Progress hairline ─────────────────────────────────────────
          // Real asset progress blended with a time ramp that parks at 0.9,
          // so the bar moves on dead connections but only completes for real.
          const bar = q("[data-progress]")[0] as HTMLElement;
          const setBar = gsap.quickSetter(bar, "scaleX");
          const t0 = performance.now();
          let shown = 0;
          const tick = () => {
            const t = Math.min((performance.now() - t0) / 2000, 1);
            const ramp = 0.9 * (1 - (1 - t) ** 3);
            const target = Math.max(loader.progress, ramp);
            shown += (target - shown) * 0.15;
            setBar(shown);
          };
          gsap.ticker.add(tick);

          // ── Exit ──────────────────────────────────────────────────────
          const playExit = contextSafe(() => {
            try {
              markIntroDone(); // hero name/tagline rise under the opening iris
              try {
                sessionStorage.setItem(SESSION_KEY, "1");
              } catch {}
              pulse.kill();
              pulseGlow.kill();
              gsap.ticker.remove(tick);
              unsub();

              const dotEl = q("[data-dot]")[0] as Element;
              const r = dotEl.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const R =
                Math.hypot(
                  Math.max(cx, window.innerWidth - cx),
                  Math.max(cy, window.innerHeight - cy)
                ) * 1.02 || Math.hypot(window.innerWidth, window.innerHeight);

              // Dot flare + content fade — short enough that GSAP ticker
              // jitter is invisible, so they stay on the timeline.
              const flare = gsap.timeline();
              flare
                .to(bar, { scaleX: 1, duration: 0.15, ease: "power1.out" }, 0)
                .to(q("[data-track]"), { opacity: 0, duration: 0.2 }, 0.15)
                .to(q("[data-dot]"), { attr: { r: DOT_R * 1.6 }, duration: 0.2, ease: "power2.in" }, 0)
                .to(q("[data-dot-glow]"), { attr: { r: GLOW_R * 2.2 }, opacity: 0.9, duration: 0.2, ease: "power2.in" }, 0)
                .to(q("[data-intro-content]"), { opacity: 0, duration: 0.25, ease: "power2.in" }, 0.15);
              s.cleanups.push(() => flare.kill());

              // Iris — driven off wall-clock rAF, not GSAP. Lenis sets
              // gsap.ticker.lagSmoothing(0), and the WebGL scene's first heavy
              // frames land right here; a GSAP tween can get advanced to its
              // end in one long frame and snap. performance.now() always spans
              // the true 900ms (choppy under load, never instant).
              const startAt = performance.now() + IRIS_DELAY_MS;
              let rafId = 0;
              const step = () => {
                const p = Math.min(Math.max((performance.now() - startAt) / IRIS_MS, 0), 1);
                const rad = easeInOut3(p) * R;
                const m = `radial-gradient(circle ${rad}px at ${cx}px ${cy}px, transparent 99.5%, #000 100%)`;
                root.style.webkitMaskImage = m;
                root.style.maskImage = m;
                if (p < 1) {
                  rafId = requestAnimationFrame(step);
                } else {
                  dismissRef.current();
                }
              };
              rafId = requestAnimationFrame(step);
              s.cleanups.push(() => cancelAnimationFrame(rafId));
            } catch {
              dismissRef.current();
            }
          });

          // ── Dismissal state machine ───────────────────────────────────
          // exit ⇐ minChoreography && (assetsReady || hardCap)
          let minReached = false;
          let capped = false;
          let exited = false;
          const tryExit = () => {
            if (exited || s.dismissed) return;
            if (minReached && (loader.ready || capped)) {
              exited = true;
              playExit();
            }
          };
          // Wall-clock, NOT gsap.delayedCall: these gate on real elapsed time
          // for the visitor. Lenis runs gsap.ticker with lagSmoothing(0), so
          // under a slow render its clock drifts from real time — a delayedCall
          // could fire seconds early. setTimeout can't.
          const minCall = window.setTimeout(() => {
            minReached = true;
            tryExit();
          }, MIN_CHOREOGRAPHY * 1000);
          const capCall = window.setTimeout(() => {
            capped = true;
            tryExit();
          }, HARD_CAP * 1000);
          const unsub = subscribeLoader(tryExit);

          s.cleanups.push(() => {
            tl.kill();
            pulse.kill();
            pulseGlow.kill();
            window.clearTimeout(minCall);
            window.clearTimeout(capCall);
            gsap.ticker.remove(tick);
            unsub();
          });
          // matchMedia revert (unmount / breakpoint teardown) — must clear
          // the wall-clock timers too, or an unmount before dismiss leaves
          // minCall/capCall armed to fire tryExit against a detached overlay.
          return () => {
            window.clearTimeout(minCall);
            window.clearTimeout(capCall);
            gsap.ticker.remove(tick);
            unsub();
          };
        });
      } catch {
        dismissRef.current();
      }
    },
    { scope: rootRef }
  );

  if (gone) return null;

  return (
    <div
      id="intro-overlay"
      ref={rootRef}
      role="status"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-90 flex items-center justify-center bg-ink"
    >
      <noscript>
        <style>{`#intro-overlay{display:none}`}</style>
      </noscript>
      {/* Texture continuity — the site's grain layer (z-70) sits below us */}
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      <div
        data-intro-content
        aria-hidden
        className="relative flex flex-col items-center gap-10"
      >
        {/* Ambient haze behind the mark — margin-centered so the GSAP scale
            tween can own transform without clobbering the centering */}
        <div
          data-glow
          className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] size-[70vmin] rounded-full"
          style={{
            margin: "-35vmin 0 0 -35vmin",
            background: `radial-gradient(closest-side, rgba(${ACCENT_RGB}, 0.11), rgba(${ACCENT_2_RGB}, 0.05) 45%, transparent 70%)`,
            opacity: 0,
            transform: "scale(0.96)",
          }}
        />

        <svg
          viewBox="0 0 220 120"
          style={{ width: "min(46vw, 340px)" }}
          fill="none"
        >
          <defs>
            <clipPath id="intro-flood">
              <rect x="0" y="120" width="220" height="120" />
            </clipPath>
            <radialGradient id="intro-dot-halo">
              <stop offset="0%" stopColor={`rgba(${ACCENT_RGB}, 0.9)`} />
              <stop offset="40%" stopColor={`rgba(${ACCENT_RGB}, 0.4)`} />
              <stop offset="100%" stopColor={`rgba(${ACCENT_RGB}, 0)`} />
            </radialGradient>
          </defs>
          {/* Chromatic echoes — magenta/violet offset copies that converge */}
          <g
            data-echo-m
            stroke={`rgba(${MAGENTA_RGB}, 0.55)`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-4 0)"
          >
            <Strokes />
          </g>
          <g
            data-echo-v
            stroke={`rgba(${ACCENT_2_RGB}, 0.55)`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(4 0)"
          >
            <Strokes />
          </g>
          {/* Lead stroke in accent, with a soft glow */}
          <g
            data-main
            stroke={`rgb(${ACCENT_RGB})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 12px rgba(${ACCENT_RGB}, 0.55))` }}
          >
            <Strokes />
          </g>
          {/* White "fill flood" — a wide-stroke twin revealed bottom-to-top by
              the clip rect (open centerline letters have no fillable region) */}
          <g
            data-fill
            clipPath="url(#intro-flood)"
            stroke="#fff"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {PATHS.map((p) => (
              <path key={p.cls} d={p.d} />
            ))}
          </g>
          <circle
            data-dot-glow
            cx="176"
            cy="89"
            r={GLOW_R}
            fill="url(#intro-dot-halo)"
            style={{ opacity: 0 }}
          />
          {/* r=0 hides it pre-JS; the pop animates the radius */}
          <circle data-dot cx="176" cy="89" r="0" fill={`rgb(${ACCENT_RGB})`} />
        </svg>

        {/* Progress hairline — real asset progress, never theatrical-complete */}
        <div
          data-track
          className="h-px w-[min(46vw,220px)] overflow-hidden bg-white/10"
          style={{ opacity: 0 }}
        >
          <div
            data-progress
            className="h-full w-full bg-accent"
            style={{ transform: "scaleX(0)", transformOrigin: "0 50%" }}
          />
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
