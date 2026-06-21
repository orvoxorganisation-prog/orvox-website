import "server-only";
import { requireSql } from "./client";
import type { Resource, ResultSet, Standing, JudgeNote } from "@/lib/data/types";

function iso(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/* ---- Resources ---------------------------------------------------------- */
export async function dbListResources(opts: { publishedOnly?: boolean } = {}): Promise<Resource[]> {
  const sql = requireSql();
  const rows = opts.publishedOnly
    ? ((await sql`select * from resources where published = true order by featured desc, updated_at desc`) as Array<Record<string, unknown>>)
    : ((await sql`select * from resources order by featured desc, updated_at desc`) as Array<Record<string, unknown>>);
  return rows.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    type: r.type as Resource["type"],
    track: r.track as Resource["track"],
    accent: r.accent as Resource["accent"],
    description: (r.description as string) ?? "",
    author: (r.author as string) ?? "",
    minutes: Number(r.minutes ?? 0),
    updatedAt: iso(r.updated_at),
    featured: Boolean(r.featured),
  }));
}

/* ---- Result sets -------------------------------------------------------- */
export async function dbListResultSets(opts: { publishedOnly?: boolean } = {}): Promise<ResultSet[]> {
  const sql = requireSql();
  const sets = opts.publishedOnly
    ? ((await sql`select * from result_sets where published = true order by decided_at desc`) as Array<Record<string, unknown>>)
    : ((await sql`select * from result_sets order by decided_at desc`) as Array<Record<string, unknown>>);
  if (sets.length === 0) return [];
  const ids = sets.map((s) => Number(s.id));
  const standings = (await sql`select * from standings where result_set_id = any(${ids}) order by rank asc`) as Array<Record<string, unknown>>;
  const notes = (await sql`select * from judge_notes where result_set_id = any(${ids})`) as Array<Record<string, unknown>>;

  const standBy = new Map<number, Standing[]>();
  for (const s of standings) {
    const list = standBy.get(Number(s.result_set_id)) ?? [];
    list.push({
      rank: Number(s.rank),
      team: s.team as string,
      members: (s.members as string[]) ?? [],
      school: (s.school as string) ?? "",
      score: Number(s.score),
      status: s.status as Standing["status"],
    });
    standBy.set(Number(s.result_set_id), list);
  }
  const notesBy = new Map<number, JudgeNote[]>();
  for (const n of notes) {
    const list = notesBy.get(Number(n.result_set_id)) ?? [];
    list.push({ by: n.by_name as string, role: (n.role as string) ?? "", points: (n.points as string[]) ?? [] });
    notesBy.set(Number(n.result_set_id), list);
  }

  return sets.map((s) => ({
    eventSlug: s.event_slug as string,
    eventTitle: s.event_title as string,
    season: s.season as string,
    roundLabel: s.round_label as string,
    decidedAt: iso(s.decided_at),
    motion: (s.motion as string) ?? "",
    standings: standBy.get(Number(s.id)) ?? [],
    judgeNotes: notesBy.get(Number(s.id)) ?? [],
  }));
}

/* ---- Settings / content / flags / nav / faqs ---------------------------- */
export async function dbGetSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const sql = requireSql();
  const rows = (await sql`select value from site_settings where key = ${key} limit 1`) as Array<{ value: T }>;
  return rows[0]?.value ?? null;
}

export async function dbGetContentBlock<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const sql = requireSql();
  const rows = (await sql`select value from content_blocks where key = ${key} limit 1`) as Array<{ value: T }>;
  return rows[0]?.value ?? null;
}

export async function dbGetFlag(key: string): Promise<boolean | null> {
  const sql = requireSql();
  const rows = (await sql`select enabled from site_flags where key = ${key} limit 1`) as Array<{ enabled: boolean }>;
  return rows[0]?.enabled ?? null;
}

export async function dbListFlags(): Promise<Record<string, boolean>> {
  const sql = requireSql();
  const rows = (await sql`select key, enabled from site_flags`) as Array<{ key: string; enabled: boolean }>;
  return Object.fromEntries(rows.map((r) => [r.key, r.enabled]));
}

export async function dbListNav(location: "header" | "footer"): Promise<
  Array<{ groupLabel: string; label: string; href: string }>
> {
  const sql = requireSql();
  const rows = (await sql`
    select group_label, label, href from nav_items
    where location = ${location} and enabled = true
    order by position asc
  `) as Array<{ group_label: string; label: string; href: string }>;
  return rows.map((r) => ({ groupLabel: r.group_label, label: r.label, href: r.href }));
}

export async function dbListPublishedFaqs(): Promise<
  Array<{ question: string; answer: string; category: string }>
> {
  const sql = requireSql();
  const rows = (await sql`
    select question, answer, category from faqs
    where published = true order by position asc
  `) as Array<{ question: string; answer: string; category: string }>;
  return rows.map((r) => ({ question: r.question, answer: r.answer, category: r.category }));
}

/* ---- Public accounts (competitors) -------------------------------------- */
/**
 * Upserts a self-service participant account, keyed by lowercased email (used
 * directly as the account id). Created on signup and on first registration so
 * the admin User Management surface reflects every real person. Returns the id.
 */
export async function dbUpsertAccount(input: { email: string; name: string; school?: string | null }): Promise<string> {
  const sql = requireSql();
  const accountId = input.email.trim().toLowerCase();
  const handle = `@${accountId.split("@")[0]}`;
  await sql`
    insert into accounts (id, name, email, handle, school, last_seen_at)
    values (${accountId}, ${input.name}, ${accountId}, ${handle}, ${input.school ?? null}, now())
    on conflict (id) do update set
      name = case when accounts.name = '' or accounts.name is null then excluded.name else accounts.name end,
      school = coalesce(accounts.school, excluded.school),
      last_seen_at = now()
  `;
  return accountId;
}

export async function dbGetAccountStatus(email: string): Promise<"active" | "banned" | null> {
  const sql = requireSql();
  const rows = (await sql`select status from accounts where id = ${email.trim().toLowerCase()} limit 1`) as Array<{ status: string }>;
  return (rows[0]?.status as "active" | "banned") ?? null;
}

/** Auth view of an account — includes the password hash. Login flow only. */
export async function dbGetAccountAuth(email: string): Promise<
  { id: string; name: string; school: string | null; status: string; passwordHash: string | null; emailVerified: boolean } | null
> {
  const sql = requireSql();
  const rows = (await sql`
    select id, name, school, status, password_hash, email_verified from accounts
    where id = ${email.trim().toLowerCase()} limit 1
  `) as Array<{ id: string; name: string; school: string | null; status: string; password_hash: string | null; email_verified: boolean }>;
  const r = rows[0];
  return r
    ? { id: r.id, name: r.name, school: r.school, status: r.status, passwordHash: r.password_hash, emailVerified: Boolean(r.email_verified) }
    : null;
}

/** Stores a password hash on an account (claims a passwordless account too). */
export async function dbSetAccountPassword(email: string, passwordHash: string): Promise<void> {
  await requireSql()`update accounts set password_hash = ${passwordHash} where id = ${email.trim().toLowerCase()}`;
}

/** Marks an account's email as verified. */
export async function dbSetEmailVerified(email: string): Promise<void> {
  await requireSql()`update accounts set email_verified = true where id = ${email.trim().toLowerCase()}`;
}

/** Full personal-data export for a user (GDPR access/portability). */
export async function dbExportAccountData(email: string): Promise<{ account: Record<string, unknown> | null; registrations: Record<string, unknown>[] }> {
  const sql = requireSql();
  const id = email.trim().toLowerCase();
  const accounts = (await sql`
    select id, name, email, handle, school, city, joined_season, status, email_verified, created_at, last_seen_at
    from accounts where id = ${id} limit 1
  `) as Array<Record<string, unknown>>;
  const registrations = (await sql`
    select event_slug, status, full_name, email, phone, school, category, motivation, registered_at
    from registrations where account_id = ${id} order by registered_at desc
  `) as Array<Record<string, unknown>>;
  return { account: accounts[0] ?? null, registrations };
}

/** Deletes a user's account and (via FK cascade) their registrations. */
export async function dbDeleteAccount(email: string): Promise<void> {
  await requireSql()`delete from accounts where id = ${email.trim().toLowerCase()}`;
}
