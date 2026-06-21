/**
 * Repository layer. Callers depend on these async functions, never on the
 * seed modules directly. Today they resolve in-memory seed data; swapping to
 * Neon means changing only this file (see src/lib/db/client.ts + schema.sql).
 */
import { redirect } from "next/navigation";
import { events } from "./data/events";
import { resources } from "./data/resources";
import { resultSets } from "./data/results";
import { achievementDefs } from "./data/account";
import { judgeProfile } from "./data/judge";
import { getSession, getStoredRegistrations } from "./session";
import { isDbConfigured } from "./db/client";
import { dbListPublishedEvents, dbGetEventBySlug } from "./db/events";
import { dbListResources, dbListResultSets } from "./db/public";
import type {
  OrvoxEvent,
  Resource,
  ResultSet,
  Account,
  Registration,
  JudgeProfile,
  JudgeRound,
  Track,
  ResourceType,
} from "./data/types";

/**
 * Reads resolve from Neon when DATABASE_URL is configured, falling back to the
 * typed seed modules if the DB is unreachable or empty. This keeps the public
 * site live even during a DB hiccup and runnable with zero config.
 */
async function publishedEvents(): Promise<OrvoxEvent[]> {
  if (!isDbConfigured) return events;
  try {
    const list = await dbListPublishedEvents();
    return list.length > 0 ? list : events;
  } catch (err) {
    console.error("getEvents: DB read failed, using seed data:", err);
    return events;
  }
}

export async function getEvents(): Promise<OrvoxEvent[]> {
  return publishedEvents();
}

export async function getUpcomingEvents(limit?: number): Promise<OrvoxEvent[]> {
  const list = (await publishedEvents())
    .filter((e) => e.status !== "closed")
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export async function getEventBySlug(slug: string): Promise<OrvoxEvent | null> {
  if (isDbConfigured) {
    try {
      const event = await dbGetEventBySlug(slug, { publishedOnly: true });
      if (event) return event;
    } catch (err) {
      console.error("getEventBySlug: DB read failed, using seed data:", err);
    }
  }
  return events.find((e) => e.slug === slug) ?? null;
}

export async function getEventsByTrack(track: Track): Promise<OrvoxEvent[]> {
  return (await publishedEvents()).filter((e) => e.track === track);
}

export async function getEventSlugs(): Promise<string[]> {
  return (await publishedEvents()).map((e) => e.slug);
}

export async function getResources(filter?: {
  type?: ResourceType;
  track?: Track;
}): Promise<Resource[]> {
  let list = resources;
  if (isDbConfigured) {
    try {
      const fromDb = await dbListResources({ publishedOnly: true });
      if (fromDb.length > 0) list = fromDb;
    } catch (err) {
      console.error("getResources: DB read failed, using seed data:", err);
    }
  }
  if (filter?.type) list = list.filter((r) => r.type === filter.type);
  if (filter?.track) list = list.filter((r) => r.track === filter.track);
  return list;
}

export async function getFeaturedResource(): Promise<Resource | null> {
  const list = await getResources();
  return list.find((r) => r.featured) ?? list[0] ?? null;
}

export async function getResultSets(): Promise<ResultSet[]> {
  if (isDbConfigured) {
    try {
      const fromDb = await dbListResultSets({ publishedOnly: true });
      return fromDb;
    } catch (err) {
      console.error("getResultSets: DB read failed, using seed data:", err);
    }
  }
  return [...resultSets].sort((a, b) => +new Date(b.decidedAt) - +new Date(a.decidedAt));
}

export async function getResultBySlug(slug: string): Promise<ResultSet | null> {
  const all = await getResultSets();
  return all.find((r) => r.eventSlug === slug) ?? null;
}

/**
 * The signed-in user's account, derived entirely from their session and their
 * real activity. A brand-new signup has zero registrations, zero earned
 * achievements, and no competition stats — nothing is pre-seeded.
 */
export async function getAccount(): Promise<Account | null> {
  const session = await getSession();
  if (!session) return null;

  // Enforce admin bans (and, when enabled, email verification): either is
  // treated as signed out.
  if (isDbConfigured) {
    try {
      const { dbGetAccountAuth } = await import("./db/public");
      const acct = await dbGetAccountAuth(session.email);
      if (acct?.status === "banned") return null;
      if (process.env.REQUIRE_EMAIL_VERIFICATION === "true" && acct && !acct.emailVerified) return null;
    } catch (err) {
      console.error("getAccount: status check failed:", err);
    }
  }

  const stored = await getStoredRegistrations();
  const registrations: Registration[] = stored
    .filter((r) => events.some((e) => e.slug === r.eventSlug))
    .map((r) => {
      const event = events.find((e) => e.slug === r.eventSlug)!;
      const nextRound = event.schedule
        .filter((s) => +new Date(s.date) > Date.now())
        .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
      return {
        eventSlug: r.eventSlug,
        registeredAt: r.registeredAt,
        status: r.status,
        nextRound: nextRound ? { label: nextRound.label, date: nextRound.date } : undefined,
      };
    });

  const hasRegistered = registrations.length > 0;

  return {
    name: session.name,
    email: session.email,
    handle: `@${session.email.split("@")[0]}`,
    school: session.school ?? null,
    city: null,
    joinedSeason: "S03",
    avatarAccent: "teal",
    registrations,
    announcements: [
      {
        id: "sys_welcome",
        type: "reminder",
        title: "Welcome to the floor",
        body: hasRegistered
          ? "Your round schedule and motions will land here as they're released."
          : "Browse the season slate and lock your first seat. Schedules and motions land here.",
        date: session.joinedAt,
        href: "/events",
      },
    ],
    achievements: achievementDefs.map((def) => ({
      ...def,
      // The only achievement derivable today: registering for a first event.
      earned: def.id === "ach_seat" && hasRegistered,
      date: def.id === "ach_seat" && hasRegistered ? stored[stored.length - 1].registeredAt : "",
    })),
    stats: {
      rounds: 0,
      events: registrations.length,
      bestRank: null,
      speakerAvg: null,
    },
  };
}

/** Like getAccount, but bounces signed-out visitors to the login page. */
export async function requireAccount(): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect("/login");
  return account;
}

export async function getJudgeProfile(): Promise<JudgeProfile> {
  return judgeProfile;
}

export async function getJudgeRound(id: string): Promise<JudgeRound | null> {
  return judgeProfile.rounds.find((r) => r.id === id) ?? null;
}
