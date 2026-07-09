// Shared state for the hero torus → portrait "Lens Handoff" morph.
// ScrollTrigger writes progress on the DOM side; the R3F scene reads it inside
// useFrame. A plain mutable module keeps the per-frame handoff out of React.
export const morph = {
  /** Raw scrubbed ScrollTrigger progress, 0..1. */
  progress: 0,
  /** True while the R3F scene is mounted — gates the WebGL→DOM handoff. */
  canvasLive: false,
};

export const MORPH_TARGET_SELECTOR = "[data-morph-target]";

/** Outer diameter of the torus in world units: 2 * (major 0.62 + tube 0.14). */
export const TORUS_OUTER_DIAMETER = 1.52;

/** Docked ring diameter relative to the circular frame's width. Tune 0.9–1.2. */
export const RING_FIT = 1.12;

// ── Phase windows of the morph ──────────────────────────────────────────────
// FLATTEN:  the tilted torus rights itself and squashes into a slim rim
// TRAVEL:   it glides from the hero center onto the About figure and shrinks
//           to fit; a moderate spin gives the move energy, decaying pre-dock
// IRIS:     the portrait aperture opens inside the settled ring
// HANDOFF:  the WebGL portrait crossfades to the real DOM figure
// DISSOLVE: the ring fades out with a slight expansion — the end state is
//           the clean, accessible DOM figure alone
export const FLATTEN = [0, 0.35] as const;
export const TRAVEL = [0.2, 0.72] as const;
export const PORTAL_OPEN_START = 0.72;
export const PORTAL_OPEN_END = 0.88;
export const DOM_HANDOFF_START = 0.85;
export const DOM_HANDOFF_END = 0.94;
export const DISSOLVE_START = 0.88;

/** Clamped 0..1 remap of `p` across the [a, b] window. */
export const phase = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));

// Fade window expressed in morph progress. The fluid recedes early to a dim
// residual (FLUID_RESIDUAL in lib/env.ts) — a ~12% veil that deliberately
// stays under the About text as connective atmosphere — then finishes fading
// and culls itself as #work approaches (env.below ramp). While the ring is
// still traveling/docked, its transmission pass composites this residual
// with the static glass background (see makeGlassBg in HeroCanvasInner).
export const FLUID_FADE = [0.15, 0.5] as const;
