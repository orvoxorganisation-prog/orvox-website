import type { JudgeProfile, ScoreCategory } from "./types";

/** The four-band ORVOX rubric used across every adjudication screen. */
export const scoreCategories: ScoreCategory[] = [
  { key: "content", label: "Content", hint: "Quality of arguments, clarity, depth", max: 5 },
  { key: "style", label: "Style", hint: "Delivery, fluency, confidence", max: 5 },
  { key: "strategy", label: "Strategy", hint: "Logic, organization, rebuttal", max: 5 },
  { key: "impact", label: "Overall Impact", hint: "Overall effectiveness", max: 5 },
];

/**
 * Judge portal data. No fabricated adjudicators or rounds: assignments appear
 * here once an organiser pairs rooms for a live event. Until then the booth
 * shows its empty states.
 */
export const judgeProfile: JudgeProfile = {
  name: "Adjudicator",
  handle: "@panel",
  accreditation: "ORVOX panel",
  roundsJudged: 0,
  rounds: [],
};
