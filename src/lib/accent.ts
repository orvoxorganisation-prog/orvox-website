import type { Accent } from "./data/types";

/**
 * Brand-triad accent system. One place that decides how yellow / teal / rose /
 * stage translate into surfaces, so cards, chips, and bars stay consistent.
 * Pastels sit next to the noir backbone, never washed over text illegibly.
 */
export interface AccentStyle {
  /** Soft pastel fill for feature cards (28r). */
  soft: string;
  /** Solid brand fill (chips, bars, fills). */
  solid: string;
  /** Readable ink color on the soft fill. */
  ink: string;
  /** Text color when used as a foreground accent on light. */
  text: string;
  /** Subtle border tint. */
  border: string;
  /** Dot / marker fill. */
  dot: string;
}

export const accentStyles: Record<Accent, AccentStyle> = {
  yellow: {
    soft: "bg-yellow-soft",
    solid: "bg-yellow text-ink-900",
    ink: "text-yellow-ink",
    text: "text-yellow-deep",
    border: "border-yellow-deep/25",
    dot: "bg-yellow",
  },
  teal: {
    soft: "bg-teal-soft",
    solid: "bg-teal text-canvas",
    ink: "text-teal-ink",
    text: "text-teal-deep",
    border: "border-teal-deep/25",
    dot: "bg-teal",
  },
  rose: {
    soft: "bg-rose-soft",
    solid: "bg-rose-deep text-canvas",
    ink: "text-rose-ink",
    text: "text-rose-deep",
    border: "border-rose-deep/25",
    dot: "bg-rose-deep",
  },
  stage: {
    soft: "bg-stage",
    solid: "bg-ink-900 text-canvas",
    ink: "text-canvas",
    text: "text-ink-900",
    border: "border-ink-800",
    dot: "bg-ink-900",
  },
};

export function accentOf(accent: Accent) {
  return accentStyles[accent];
}

/**
 * Dark-surface accent system — how the signal triad reads on void/stage.
 * Signal text, translucent washes, lamps, and solid chips that hold AA
 * contrast against the noir backbone.
 */
export interface DarkAccentStyle {
  /** Signal text color on dark. */
  text: string;
  /** Translucent wash for tinted plates. */
  dim: string;
  /** Border tint. */
  border: string;
  /** Lamp / marker fill. */
  dot: string;
  /** Solid chip (always dark ink on the signal color). */
  solid: string;
}

export const darkAccentStyles: Record<Accent, DarkAccentStyle> = {
  yellow: {
    text: "text-yellow",
    dim: "bg-yellow/10",
    border: "border-yellow/25",
    dot: "bg-yellow",
    solid: "bg-yellow text-ink-900",
  },
  teal: {
    text: "text-teal",
    dim: "bg-teal/10",
    border: "border-teal/25",
    dot: "bg-teal",
    solid: "bg-teal text-ink-900",
  },
  rose: {
    text: "text-rose-deep",
    dim: "bg-rose-deep/10",
    border: "border-rose-deep/25",
    dot: "bg-rose-deep",
    solid: "bg-rose-deep text-ink-900",
  },
  stage: {
    text: "text-ink-200",
    dim: "bg-white/5",
    border: "border-white/15",
    dot: "bg-ink-300",
    solid: "bg-canvas text-ink-900",
  },
};

export function darkAccentOf(accent: Accent) {
  return darkAccentStyles[accent];
}

/** Track → label, for chips and filters. */
export const trackLabel: Record<string, string> = {
  debate: "Debate",
  pitch: "Pitch",
  speaking: "Speaking",
  oped: "Op-Ed",
};
