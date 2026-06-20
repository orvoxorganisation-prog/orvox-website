/**
 * Motion tokens — shared between CSS, GSAP, and Motion (Framer).
 * Snappy, never bouncy. 120 / 260 / 420 from the ORVOX motion board.
 */

/** Cubic-bezier control points (GSAP / Motion friendly). */
export const ease = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outExpo: [0.16, 1, 0.3, 1] as const,
  snappy: [0.2, 0, 0, 1] as const,
  drawer: [0.32, 0.72, 0, 1] as const,
};

/** GSAP-string easings (CustomEase-free, native power curves). */
export const gsapEase = {
  out: "power3.out",
  outExpo: "expo.out",
  inOut: "power2.inOut",
} as const;

/** Durations in seconds. */
export const duration = {
  micro: 0.12,
  ui: 0.26,
  stage: 0.42,
} as const;

/** Stagger steps (seconds) — keep short so lists never feel slow. */
export const stagger = {
  tight: 0.05,
  base: 0.07,
  loose: 0.09,
} as const;

/** Spring presets (Apple-style: duration + bounce). */
export const spring = {
  soft: { type: "spring", duration: 0.5, bounce: 0.15 },
  press: { type: "spring", duration: 0.3, bounce: 0.1 },
} as const;
