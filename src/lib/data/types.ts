/**
 * Domain types — mirror the Postgres schema in src/lib/db/schema.sql.
 * The seed modules implement these; the repo layer reads them today and can
 * swap to Neon without touching callers.
 */

export type Accent = "yellow" | "teal" | "rose" | "stage";

export type Track = "debate" | "pitch" | "speaking" | "oped";

export type EventStatus =
  | "open" // registration open
  | "closing-soon" // < 72h to deadline
  | "live" // happening now
  | "upcoming" // announced, not yet open
  | "closed"; // registration closed / done

export interface ScheduleRound {
  label: string; // "Round 1 · Opening"
  date: string; // ISO
  detail: string; // "British Parliamentary · 4 teams / room"
}

export interface EventContact {
  name: string;
  role: string;
  email: string;
}

export interface OrvoxEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string; // cinematic italic accent line
  season: string; // "S03"
  track: Track;
  accent: Accent;
  status: EventStatus;
  format: string; // "British Parliamentary"
  mode: "Online" | "On-site" | "Hybrid";
  venue: string; // "Online" or "Taj Lands End, Mumbai"
  city: string;
  startDate: string; // ISO
  endDate: string; // ISO
  registrationDeadline: string; // ISO
  eligibility: string; // short line for cards
  seatsTotal: number;
  seatsFilled: number;
  prizePool?: number; // INR
  heroStat: { value: string; label: string };
  summary: string; // one-line listing blurb
  about: string[]; // paragraphs
  rules: string[];
  schedule: ScheduleRound[];
  eligibilityDetails: string[];
  contact: EventContact;
  tags: string[];
}

export type ResourceType = "guide" | "drill" | "template" | "video" | "reference";

export interface Resource {
  id: string;
  slug: string;
  title: string;
  type: ResourceType;
  track: Track;
  accent: Accent;
  description: string;
  author: string;
  minutes: number; // reading / watch time
  updatedAt: string; // ISO
  featured?: boolean;
}

export type StandingStatus = "champion" | "advanced" | "eliminated";

export interface Standing {
  rank: number;
  team: string;
  members: string[];
  school: string;
  score: number;
  status: StandingStatus;
}

export interface JudgeNote {
  by: string; // judge name
  role: string; // "Chair · Round 4"
  points: string[]; // bullet feedback
}

export interface ResultSet {
  eventSlug: string;
  eventTitle: string;
  season: string;
  roundLabel: string; // "Grand Final · Room 1"
  decidedAt: string; // ISO
  motion: string;
  standings: Standing[];
  judgeNotes: JudgeNote[];
}

/* ---- Account (demo participant) ---- */

export type AnnouncementType = "schedule" | "result" | "reminder" | "feedback";

export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  body: string;
  date: string; // ISO
  href?: string;
}

export interface Registration {
  eventSlug: string;
  registeredAt: string;
  status: "confirmed" | "waitlist";
  nextRound?: { label: string; date: string };
}

export interface Achievement {
  id: string;
  title: string;
  detail: string;
  date: string;
  accent: Accent;
  earned: boolean;
}

export interface Account {
  name: string;
  email: string;
  handle: string;
  school: string | null;
  city: string | null;
  joinedSeason: string;
  avatarAccent: Accent;
  registrations: Registration[];
  announcements: Announcement[];
  achievements: Achievement[];
  /** Competition stats are null until the user has actually competed. */
  stats: { rounds: number; events: number; bestRank: number | null; speakerAvg: number | null };
}

/* ---- Judge portal ---- */

export interface ScoreCategory {
  key: string;
  label: string;
  hint: string;
  max: 5;
}

export interface JudgeRound {
  id: string;
  eventTitle: string;
  season: string;
  roundLabel: string; // "Round 2 · Room 3"
  room: string;
  motion: string;
  startsAt: string; // ISO
  status: "assigned" | "scoring" | "submitted";
  teamA: { name: string; school: string };
  teamB: { name: string; school: string };
  categories: ScoreCategory[];
}

export interface JudgeProfile {
  name: string;
  handle: string;
  accreditation: string; // "Accredited · National"
  roundsJudged: number;
  rounds: JudgeRound[];
}
