// Ambient/environment scroll state. Same contract as lib/morph.ts: bare
// ScrollTriggers write on the DOM side, the R3F scene reads inside useFrame.
// A plain mutable module keeps the per-frame reads out of React.
export const env = {
  /** 0 at page top → 1 at max scroll. Drives the star parallax drift. */
  pageProgress: 0,
  /** 0 through hero/About → 1 as #work approaches. Drives the star
   *  recovery after the dissolve burst and the fluid residual → cull. */
  below: 0,
};

/** Star opacity below the fold — ≈25% of the hero's 0.5 peak. */
export const STAR_RESIDUAL = 0.125;

/** Nebula alpha floor through About: dim veil instead of dead black. */
export const FLUID_RESIDUAL = 0.12;

/** World-unit y drift of the dust field across the full page scroll. */
export const STAR_PARALLAX = 0.35;

// ── Section anchors — single source of truth ────────────────────────────
// "When does a section become active" is consumed by two mechanisms: the
// discrete glow palette (AmbientGlow) and the continuous below-fold ramp
// (EnvDriver → the WebGL scene). Defining both here keeps them from
// drifting apart when the page structure or thresholds are tuned.
export const SECTION_SELECTORS = {
  about: "#positioning",
  skills: "#skills",
  work: "#work",
  projects: "#projects",
  education: "#education",
  certifications: "#certifications",
  beyond: "#beyond",
  contact: "#contact",
} as const;

/** Trigger window inside which a section owns the ambient palette. */
export const SECTION_ACTIVE = { start: "top 55%", end: "bottom 45%" } as const;

/** The below-fold ramp: spans the Marquee + Skills gap between About and
 *  Experience. ASSUMES nothing is pinned above #work (see EnvDriver for the
 *  full note) — Skills must never pin. */
export const BELOW_RAMP = {
  trigger: SECTION_SELECTORS.work,
  start: "top bottom",
  end: "top 35%",
} as const;
