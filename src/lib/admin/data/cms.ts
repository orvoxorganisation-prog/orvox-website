import "server-only";
import { requireSql } from "@/lib/db/client";
import type { ContentBlock, Faq, NavItem, SiteFlag } from "../types";

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v ?? ""));

/* ---- Content blocks ----------------------------------------------------- */
export async function listContentBlocks(): Promise<ContentBlock[]> {
  const rows = (await requireSql()`select * from content_blocks order by grp, key`) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    key: r.key as string,
    grp: r.grp as string,
    label: r.label as string,
    value: (r.value as Record<string, unknown>) ?? {},
    updatedAt: iso(r.updated_at),
    updatedBy: (r.updated_by as string) ?? null,
  }));
}

export async function getContentBlock(key: string): Promise<ContentBlock | null> {
  const rows = (await requireSql()`select * from content_blocks where key = ${key} limit 1`) as Array<Record<string, unknown>>;
  const r = rows[0];
  if (!r) return null;
  return { key: r.key as string, grp: r.grp as string, label: r.label as string, value: (r.value as Record<string, unknown>) ?? {}, updatedAt: iso(r.updated_at), updatedBy: (r.updated_by as string) ?? null };
}

export async function updateContentBlock(key: string, value: Record<string, unknown>, updatedBy: string | null): Promise<void> {
  await requireSql()`
    update content_blocks set value = ${JSON.stringify(value)}, updated_at = now(), updated_by = ${updatedBy}
    where key = ${key}
  `;
}

/* ---- FAQs --------------------------------------------------------------- */
export async function listFaqs(): Promise<Faq[]> {
  const rows = (await requireSql()`select * from faqs order by position asc, id asc`) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    question: r.question as string,
    answer: r.answer as string,
    category: r.category as string,
    position: Number(r.position),
    published: Boolean(r.published),
    updatedAt: iso(r.updated_at),
  }));
}

export async function createFaq(input: { question: string; answer: string; category: string; position: number; published: boolean }): Promise<void> {
  await requireSql()`
    insert into faqs (question, answer, category, position, published)
    values (${input.question}, ${input.answer}, ${input.category}, ${input.position}, ${input.published})
  `;
}

export async function updateFaq(faqId: number, input: { question: string; answer: string; category: string; position: number; published: boolean }): Promise<void> {
  await requireSql()`
    update faqs set question = ${input.question}, answer = ${input.answer}, category = ${input.category},
      position = ${input.position}, published = ${input.published}, updated_at = now()
    where id = ${faqId}
  `;
}

export async function deleteFaq(faqId: number): Promise<void> {
  await requireSql()`delete from faqs where id = ${faqId}`;
}

/* ---- Navigation --------------------------------------------------------- */
export async function listNavItems(): Promise<NavItem[]> {
  const rows = (await requireSql()`select * from nav_items order by location, position asc`) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    location: r.location as NavItem["location"],
    groupLabel: r.group_label as string,
    label: r.label as string,
    href: r.href as string,
    position: Number(r.position),
    enabled: Boolean(r.enabled),
  }));
}

export async function createNavItem(input: Omit<NavItem, "id">): Promise<void> {
  await requireSql()`
    insert into nav_items (location, group_label, label, href, position, enabled)
    values (${input.location}, ${input.groupLabel}, ${input.label}, ${input.href}, ${input.position}, ${input.enabled})
  `;
}

export async function updateNavItem(navId: number, input: Omit<NavItem, "id">): Promise<void> {
  await requireSql()`
    update nav_items set location = ${input.location}, group_label = ${input.groupLabel}, label = ${input.label},
      href = ${input.href}, position = ${input.position}, enabled = ${input.enabled}
    where id = ${navId}
  `;
}

export async function deleteNavItem(navId: number): Promise<void> {
  await requireSql()`delete from nav_items where id = ${navId}`;
}

/* ---- Settings ----------------------------------------------------------- */
export async function getAllSettings(): Promise<Record<string, Record<string, unknown>>> {
  const rows = (await requireSql()`select key, value from site_settings`) as Array<{ key: string; value: Record<string, unknown> }>;
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function updateSetting(key: string, value: Record<string, unknown>, updatedBy: string | null): Promise<void> {
  await requireSql()`
    insert into site_settings (key, value, updated_by) values (${key}, ${JSON.stringify(value)}, ${updatedBy})
    on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by
  `;
}

/* ---- Flags -------------------------------------------------------------- */
export async function listFlags(): Promise<SiteFlag[]> {
  const rows = (await requireSql()`select * from site_flags order by grp, key`) as Array<Record<string, unknown>>;
  return rows.map((r) => ({ key: r.key as string, label: r.label as string, grp: r.grp as string, enabled: Boolean(r.enabled), updatedAt: iso(r.updated_at) }));
}

export async function setFlag(key: string, enabled: boolean): Promise<void> {
  await requireSql()`update site_flags set enabled = ${enabled}, updated_at = now() where key = ${key}`;
}

/* ---- Announcements (global wire feed) ----------------------------------- */
export interface AdminAnnouncement {
  id: string;
  type: string;
  title: string;
  body: string;
  date: string;
  href: string | null;
  published: boolean;
}

export async function listAnnouncements(): Promise<AdminAnnouncement[]> {
  const rows = (await requireSql()`select * from announcements where account_id is null order by date desc`) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: r.id as string,
    type: r.type as string,
    title: r.title as string,
    body: (r.body as string) ?? "",
    date: iso(r.date),
    href: (r.href as string) ?? null,
    published: Boolean(r.published),
  }));
}

export async function createAnnouncement(input: { id: string; type: string; title: string; body: string; href: string | null; published: boolean }): Promise<void> {
  await requireSql()`
    insert into announcements (id, account_id, type, title, body, date, href, published)
    values (${input.id}, null, ${input.type}, ${input.title}, ${input.body}, now(), ${input.href}, ${input.published})
  `;
}

export async function updateAnnouncement(annId: string, input: { type: string; title: string; body: string; href: string | null; published: boolean }): Promise<void> {
  await requireSql()`
    update announcements set type = ${input.type}, title = ${input.title}, body = ${input.body}, href = ${input.href}, published = ${input.published}
    where id = ${annId}
  `;
}

export async function deleteAnnouncement(annId: string): Promise<void> {
  await requireSql()`delete from announcements where id = ${annId}`;
}
