// Shared motion vocabulary — one easing language and one set of media
// queries across every GSAP component so nothing feels like it came from a
// different site and no JS breakpoint can drift from the Tailwind classes.

/** GSAP settle ease — pairs with the cubic-bezier(0.22, 1, 0.36, 1) used by
 *  the View Transitions CSS in app/globals.css. */
export const GSAP_EASE = "power3.out";

// ── Media queries — single source of truth ──────────────────────────────
// BP_DESKTOP mirrors Tailwind's `md:`; if the breakpoint ever changes, this
// constant and the Tailwind config must move together.
export const BP_DESKTOP = "(min-width: 768px)";
export const BP_MOBILE = "(max-width: 767px)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCE = "(prefers-reduced-motion: reduce)";
