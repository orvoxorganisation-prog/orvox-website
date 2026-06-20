import type { Account } from "./types";

/**
 * Achievement definitions only — what CAN be earned, never pre-earned.
 * A new account starts with every plaque locked; unlock logic lives in the
 * repo layer and derives from the user's real activity.
 */
export const achievementDefs: Omit<Account["achievements"][number], "earned" | "date">[] = [
  { id: "ach_seat", title: "Seat locked", detail: "Register for your first ORVOX event", accent: "teal" },
  { id: "ach_first", title: "First round", detail: "Walk into your first ORVOX room", accent: "teal" },
  { id: "ach_quarter", title: "Quarter-finalist", detail: "Break to the last 8 in any event", accent: "yellow" },
  { id: "ach_speaker", title: "Top speaker", detail: "Best individual score in a room", accent: "rose" },
  { id: "ach_byline", title: "On the wall", detail: "Get an Op-Ed Sprint byline published", accent: "stage" },
  { id: "ach_champion", title: "Champion", detail: "Win an ORVOX championship", accent: "yellow" },
];
