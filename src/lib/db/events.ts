import "server-only";
import { requireSql } from "./client";
import type { OrvoxEvent, ScheduleRound } from "@/lib/data/types";

/** Admin view of an event — public fields plus operational metadata. */
export interface AdminEvent extends OrvoxEvent {
  published: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type EventRow = Record<string, unknown>;

function iso(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function rowToAdminEvent(r: EventRow, schedule: ScheduleRound[]): AdminEvent {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    subtitle: (r.subtitle as string) ?? "",
    season: (r.season as string) ?? "",
    track: r.track as OrvoxEvent["track"],
    accent: r.accent as OrvoxEvent["accent"],
    status: r.status as OrvoxEvent["status"],
    format: (r.format as string) ?? "",
    mode: r.mode as OrvoxEvent["mode"],
    venue: (r.venue as string) ?? "",
    city: (r.city as string) ?? "",
    startDate: iso(r.start_date),
    endDate: iso(r.end_date),
    registrationDeadline: iso(r.registration_deadline),
    eligibility: (r.eligibility as string) ?? "",
    seatsTotal: Number(r.seats_total ?? 0),
    seatsFilled: Number(r.seats_filled ?? 0),
    prizePool: r.prize_pool == null ? undefined : Number(r.prize_pool),
    heroStat: { value: (r.hero_stat_value as string) ?? "", label: (r.hero_stat_label as string) ?? "" },
    summary: (r.summary as string) ?? "",
    about: (r.about as string[]) ?? [],
    rules: (r.rules as string[]) ?? [],
    schedule,
    eligibilityDetails: (r.eligibility_details as string[]) ?? [],
    contact: {
      name: (r.contact_name as string) ?? "",
      role: (r.contact_role as string) ?? "",
      email: (r.contact_email as string) ?? "",
    },
    tags: (r.tags as string[]) ?? [],
    published: Boolean(r.published),
    featured: Boolean(r.featured),
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

async function attachSchedules(rows: EventRow[]): Promise<AdminEvent[]> {
  if (rows.length === 0) return [];
  const sql = requireSql();
  const ids = rows.map((r) => r.id as string);
  const sched = (await sql`
    select event_id, label, date, detail from schedule_rounds
    where event_id = any(${ids})
    order by event_id, position
  `) as Array<{ event_id: string; label: string; date: unknown; detail: string }>;
  const byEvent = new Map<string, ScheduleRound[]>();
  for (const s of sched) {
    const list = byEvent.get(s.event_id) ?? [];
    list.push({ label: s.label, date: iso(s.date), detail: s.detail });
    byEvent.set(s.event_id, list);
  }
  return rows.map((r) => rowToAdminEvent(r, byEvent.get(r.id as string) ?? []));
}

/** All events including drafts — admin only. */
export async function dbListAllEvents(): Promise<AdminEvent[]> {
  const sql = requireSql();
  const rows = (await sql`select * from events order by sort_order asc, start_date asc`) as EventRow[];
  return attachSchedules(rows);
}

/** Published events only — for the public site. */
export async function dbListPublishedEvents(): Promise<AdminEvent[]> {
  const sql = requireSql();
  const rows = (await sql`
    select * from events where published = true
    order by sort_order asc, start_date asc
  `) as EventRow[];
  return attachSchedules(rows);
}

export async function dbGetEventBySlug(slug: string, opts: { publishedOnly?: boolean } = {}): Promise<AdminEvent | null> {
  const sql = requireSql();
  const rows = (await sql`select * from events where slug = ${slug} limit 1`) as EventRow[];
  if (rows.length === 0) return null;
  if (opts.publishedOnly && !rows[0].published) return null;
  const [event] = await attachSchedules(rows);
  return event;
}

export async function dbGetEventById(id: string): Promise<AdminEvent | null> {
  const sql = requireSql();
  const rows = (await sql`select * from events where id = ${id} limit 1`) as EventRow[];
  if (rows.length === 0) return null;
  const [event] = await attachSchedules(rows);
  return event;
}
