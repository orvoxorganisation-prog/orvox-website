import "server-only";
import { requireSql } from "@/lib/db/client";
import type { AdminAccount } from "../types";

function rowToAccount(r: Record<string, unknown>): AdminAccount {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    handle: (r.handle as string) ?? null,
    school: (r.school as string) ?? null,
    city: (r.city as string) ?? null,
    status: r.status as AdminAccount["status"],
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    lastSeenAt: r.last_seen_at ? (r.last_seen_at instanceof Date ? r.last_seen_at.toISOString() : String(r.last_seen_at)) : null,
    registrationCount: Number(r.registration_count ?? 0),
  };
}

export async function listAccounts(filter: { search?: string | null; status?: string | null; limit?: number; offset?: number } = {}): Promise<{ rows: AdminAccount[]; total: number }> {
  const sql = requireSql();
  const search = filter.search ? `%${filter.search}%` : null;
  const status = filter.status ?? null;
  const limit = Math.min(filter.limit ?? 50, 500);
  const offset = filter.offset ?? 0;

  const rows = (await sql`
    select a.*, (select count(*)::int from registrations r where r.account_id = a.id) as registration_count
    from accounts a
    where (${search}::text is null or a.name ilike ${search} or a.email ilike ${search} or a.school ilike ${search})
      and (${status}::text is null or a.status = ${status})
    order by a.created_at desc
    limit ${limit} offset ${offset}
  `) as Array<Record<string, unknown>>;

  const totals = (await sql`
    select count(*)::int as n from accounts a
    where (${search}::text is null or a.name ilike ${search} or a.email ilike ${search} or a.school ilike ${search})
      and (${status}::text is null or a.status = ${status})
  `) as Array<{ n: number }>;

  return { rows: rows.map(rowToAccount), total: totals[0]?.n ?? 0 };
}

export async function getAccountById(accountId: string): Promise<AdminAccount | null> {
  const sql = requireSql();
  const rows = (await sql`
    select a.*, (select count(*)::int from registrations r where r.account_id = a.id) as registration_count
    from accounts a where a.id = ${accountId} limit 1
  `) as Array<Record<string, unknown>>;
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function setAccountStatus(accountId: string, status: "active" | "banned"): Promise<void> {
  await requireSql()`update accounts set status = ${status} where id = ${accountId}`;
}

export async function deleteAccount(accountId: string): Promise<void> {
  await requireSql()`delete from accounts where id = ${accountId}`;
}
