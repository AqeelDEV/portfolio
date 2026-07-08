// Shared state for the intro preloader. The R3F scene reports asset progress
// and readiness; the IntroOverlay consumes it and reports back when the iris
// exit begins so gated on-load reveals (hero name/tagline) can start. A plain
// mutable module keeps the R3F↔DOM handoff out of React, same as lib/morph.ts,
// plus a subscriber set because the overlay needs a push, not a per-frame read.
export const loader = {
  /** Real asset progress 0..1 (three's DefaultLoadingManager). */
  progress: 0,
  /** Hero texture resolved — or the canvas will never mount, so nothing to wait for. */
  ready: false,
  /** Set at iris-start (or when the intro is skipped) — opens the Reveal gate. */
  introDone: false,
};

const subs = new Set<() => void>();

export const subscribeLoader = (fn: () => void) => {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
};

const emit = () => {
  for (const fn of [...subs]) fn();
};

/** Monotonic — a late/duplicate report can never walk progress backwards. */
export const markProgress = (p: number) => {
  if (p > loader.progress) {
    loader.progress = Math.min(p, 1);
    emit();
  }
};

export const markReady = () => {
  if (!loader.ready) {
    loader.ready = true;
    loader.progress = 1;
    emit();
  }
};

/** Reduced motion / no WebGL: the scene never mounts, so readiness is moot. */
export const markCanvasSkipped = markReady;

export const markIntroDone = () => {
  if (!loader.introDone) {
    loader.introDone = true;
    emit();
  }
};

/**
 * One-shot: run `fn` once the intro has finished (immediately if it already
 * has). Subscribes before re-checking the flag so a flip between "caller
 * checked" and "caller subscribed" can never be missed, whatever the effect
 * ordering. Returns an unsubscribe for unmount cleanup.
 */
export const whenIntroDone = (fn: () => void): (() => void) => {
  if (loader.introDone) {
    fn();
    return () => {};
  }
  let fired = false;
  const fire = () => {
    if (loader.introDone && !fired) {
      fired = true;
      unsub();
      fn();
    }
  };
  const unsub = subscribeLoader(fire);
  fire();
  return unsub;
};
