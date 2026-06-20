import "server-only";
import { requireSql } from "@/lib/db/client";
import { toCsv } from "../util";
import type { AdminRegistration } from "../types";

interface RegFilter {
  eventSlug?: string | null;
  status?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}

function rowToReg(r: Record<string, unknown>): AdminRegistration {
  return {
    id: Number(r.id),
    accountId: (r.account_id as string) ?? null,
    eventSlug: r.event_slug as string,
    eventTitle: (r.event_title as string) ?? null,
    registeredAt: r.registered_at instanceof Date ? r.registered_at.toISOString() : String(r.registered_at),
    status: r.status as AdminRegistration["status"],
    fullName: r.full_name as string,
    email: r.email as string,
    phone: (r.phone as string) ?? null,
    school: (r.school as string) ?? "",
    category: (r.category as string) ?? null,
    motivation: (r.motivation as string) ?? null,
  };
}

export async function listRegistrations(filter: RegFilter = {}): Promise<{ rows: AdminRegistration[]; total: number }> {
  const sql = requireSql();
  const eventSlug = filter.eventSlug ?? null;
  const status = filter.status ?? null;
  const search = filter.search ? `%${filter.search}%` : null;
  const limit = Math.min(filter.limit ?? 50, 500);
  const offset = filter.offset ?? 0;

  const rows = (await sql`
    select r.*, e.title as event_title
    from registrations r
    left join events e on e.slug = r.event_slug
    where (${eventSlug}::text is null or r.event_slug = ${eventSlug})
      and (${status}::text is null or r.status::text = ${status})
      and (${search}::text is null or r.full_name ilike ${search} or r.email ilike ${search} or r.school ilike ${search})
    order by r.registered_at desc
    limit ${limit} offset ${offset}
  `) as Array<Record<string, unknown>>;

  const totals = (await sql`
    select count(*)::int as n from registrations r
    where (${eventSlug}::text is null or r.event_slug = ${eventSlug})
      and (${status}::text is null or r.status::text = ${status})
      and (${search}::text is null or r.full_name ilike ${search} or r.email ilike ${search} or r.school ilike ${search})
  `) as Array<{ n: number }>;

  return { rows: rows.map(rowToReg), total: totals[0]?.n ?? 0 };
}

export async function updateRegistrationStatus(regId: number, status: "confirmed" | "waitlist"): Promise<void> {
  await requireSql()`update registrations set status = ${status} where id = ${regId}`;
}

export async function deleteRegistration(regId: number): Promise<void> {
  await requireSql()`delete from registrations where id = ${regId}`;
}

export async function exportRegistrationsCsv(eventSlug?: string | null): Promise<string> {
  const sql = requireSql();
  const slug = eventSlug ?? null;
  const rows = (await sql`
    select r.*, e.title as event_title
    from registrations r
    left join events e on e.slug = r.event_slug
    where (${slug}::text is null or r.event_slug = ${slug})
    order by r.registered_at desc
  `) as Array<Record<string, unknown>>;

  const headers = ["Registered At", "Event", "Status", "Full Name", "Email", "Phone", "School", "Category", "Motivation"];
  const data = rows.map((r) => {
    const reg = rowToReg(r);
    return [reg.registeredAt, reg.eventTitle ?? reg.eventSlug, reg.status, reg.fullName, reg.email, reg.phone ?? "", reg.school, reg.category ?? "", reg.motivation ?? ""];
  });
  return toCsv(headers, data);
}

/** Per-event registration analytics for the dashboard. */
export async function registrationAnalytics(): Promise<{
  perEvent: Array<{ slug: string; title: string; confirmed: number; waitlist: number; seatsTotal: number }>;
  byDay: Array<{ day: string; count: number }>;
}> {
  const sql = requireSql();
  const perEvent = (await sql`
    select e.slug, e.title, e.seats_total,
      count(*) filter (where r.status = 'confirmed')::int as confirmed,
      count(*) filter (where r.status = 'waitlist')::int as waitlist
    from registrations r
    join events e on e.slug = r.event_slug
    group by e.slug, e.title, e.seats_total
    order by confirmed desc
  `) as Array<{ slug: string; title: string; seats_total: number; confirmed: number; waitlist: number }>;

  const byDay = (await sql`
    select to_char(date_trunc('day', registered_at), 'YYYY-MM-DD') as day, count(*)::int as count
    from registrations
    where registered_at > now() - interval '30 days'
    group by day order by day asc
  `) as Array<{ day: string; count: number }>;

  return {
    perEvent: perEvent.map((p) => ({ slug: p.slug, title: p.title, confirmed: p.confirmed, waitlist: p.waitlist, seatsTotal: p.seats_total })),
    byDay,
  };
}
