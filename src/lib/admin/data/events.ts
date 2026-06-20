import "server-only";
import { requireSql } from "@/lib/db/client";
import { dbListAllEvents, dbGetEventById, type AdminEvent } from "@/lib/db/events";
import { id as genId, slugify } from "../util";
import type { EventInput } from "../validation";

export { dbListAllEvents as adminListEvents, dbGetEventById as adminGetEvent };
export type { AdminEvent };

export interface ScheduleInput {
  label: string;
  date: string;
  detail: string;
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const sql = requireSql();
  let slug = slugify(base) || genId("event");
  let n = 1;
  // Try until free.
  for (;;) {
    const rows = (await sql`select id from events where slug = ${slug} limit 1`) as Array<{ id: string }>;
    if (rows.length === 0 || rows[0].id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

function eventParams(input: EventInput) {
  return [
    input.title,
    input.subtitle ?? "",
    input.season ?? "S03",
    input.track,
    input.accent,
    input.status,
    input.format ?? "",
    input.mode,
    input.venue ?? "",
    input.city ?? "",
    input.startDate,
    input.endDate,
    input.registrationDeadline,
    input.eligibility ?? "",
    input.seatsTotal,
    input.seatsFilled,
    input.prizePool ?? null,
    input.heroStatValue ?? "",
    input.heroStatLabel ?? "",
    input.summary ?? "",
    input.about,
    input.rules,
    input.eligibilityDetails,
    input.contactName ?? "",
    input.contactRole ?? "",
    input.contactEmail ?? "",
    input.tags,
    input.published,
    input.featured,
  ];
}

async function replaceSchedule(eventId: string, schedule: ScheduleInput[]): Promise<void> {
  const sql = requireSql();
  await sql`delete from schedule_rounds where event_id = ${eventId}`;
  let pos = 0;
  for (const r of schedule) {
    if (!r.label && !r.date) continue;
    await sql`
      insert into schedule_rounds (event_id, position, label, date, detail)
      values (${eventId}, ${pos++}, ${r.label}, ${r.date}, ${r.detail ?? ""})
    `;
  }
}

export async function createEvent(input: EventInput, schedule: ScheduleInput[] = []): Promise<string> {
  const sql = requireSql();
  const eventId = genId("evt");
  const slug = await ensureUniqueSlug(input.slug || input.title);
  const maxRow = (await sql`select coalesce(max(sort_order), -1) + 1 as next from events`) as Array<{ next: number }>;
  const sortOrder = maxRow[0]?.next ?? 0;

  await sql.query(
    `insert into events (
      id, slug, title, subtitle, season, track, accent, status, format, mode,
      venue, city, start_date, end_date, registration_deadline, eligibility,
      seats_total, seats_filled, prize_pool, hero_stat_value, hero_stat_label,
      summary, about, rules, eligibility_details, contact_name, contact_role,
      contact_email, tags, published, featured, sort_order
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
    )`,
    [eventId, slug, ...eventParams(input), sortOrder],
  );
  await replaceSchedule(eventId, schedule);
  return eventId;
}

export async function updateEvent(eventId: string, input: EventInput, schedule: ScheduleInput[] = []): Promise<void> {
  const sql = requireSql();
  const slug = await ensureUniqueSlug(input.slug || input.title, eventId);
  await sql.query(
    `update events set
      slug=$2, title=$3, subtitle=$4, season=$5, track=$6, accent=$7, status=$8,
      format=$9, mode=$10, venue=$11, city=$12, start_date=$13, end_date=$14,
      registration_deadline=$15, eligibility=$16, seats_total=$17, seats_filled=$18,
      prize_pool=$19, hero_stat_value=$20, hero_stat_label=$21, summary=$22,
      about=$23, rules=$24, eligibility_details=$25, contact_name=$26,
      contact_role=$27, contact_email=$28, tags=$29, published=$30, featured=$31,
      updated_at=now()
    where id=$1`,
    [eventId, slug, ...eventParams(input)],
  );
  await replaceSchedule(eventId, schedule);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await requireSql()`delete from events where id = ${eventId}`;
}

export async function duplicateEvent(eventId: string): Promise<string | null> {
  const original = await dbGetEventById(eventId);
  if (!original) return null;
  const sql = requireSql();
  const newId = genId("evt");
  const slug = await ensureUniqueSlug(`${original.slug}-copy`);
  await sql.query(
    `insert into events (
      id, slug, title, subtitle, season, track, accent, status, format, mode,
      venue, city, start_date, end_date, registration_deadline, eligibility,
      seats_total, seats_filled, prize_pool, hero_stat_value, hero_stat_label,
      summary, about, rules, eligibility_details, contact_name, contact_role,
      contact_email, tags, published, featured, sort_order
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
    )`,
    [
      newId, slug, `${original.title} (copy)`, original.subtitle, original.season,
      original.track, original.accent, original.status, original.format, original.mode,
      original.venue, original.city, original.startDate, original.endDate,
      original.registrationDeadline, original.eligibility, original.seatsTotal, 0,
      original.prizePool ?? null, original.heroStat.value, original.heroStat.label,
      original.summary, original.about, original.rules, original.eligibilityDetails,
      original.contact.name, original.contact.role, original.contact.email,
      original.tags, false /* draft */, false /* not featured */, original.sortOrder + 1,
    ],
  );
  await replaceSchedule(newId, original.schedule.map((s) => ({ label: s.label, date: s.date, detail: s.detail })));
  return newId;
}

export async function setEventPublished(eventId: string, published: boolean): Promise<void> {
  await requireSql()`update events set published = ${published}, updated_at = now() where id = ${eventId}`;
}

export async function setEventFeatured(eventId: string, featured: boolean): Promise<void> {
  await requireSql()`update events set featured = ${featured}, updated_at = now() where id = ${eventId}`;
}

export async function bulkSetPublished(ids: string[], published: boolean): Promise<number> {
  if (ids.length === 0) return 0;
  const sql = requireSql();
  const rows = (await sql`update events set published = ${published}, updated_at = now() where id = any(${ids}) returning id`) as unknown[];
  return rows.length;
}

export async function bulkDeleteEvents(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const sql = requireSql();
  const rows = (await sql`delete from events where id = any(${ids}) returning id`) as unknown[];
  return rows.length;
}
