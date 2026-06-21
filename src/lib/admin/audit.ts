import "server-only";
import { headers } from "next/headers";
import { requireSql } from "@/lib/db/client";
import type { AuditLogEntry } from "./types";

/**
 * Append-only audit log. Every admin mutation records who, what, and when.
 * Failures here never block the underlying action.
 */
export async function logAudit(input: {
  admin: { id: string; email: string } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    let ip: string | null = null;
    try {
      const h = await headers();
      ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    } catch {
      /* headers unavailable outside request scope */
    }
    await requireSql()`
      insert into audit_logs (admin_id, admin_email, action, entity_type, entity_id, summary, metadata, ip)
      values (
        ${input.admin?.id ?? null},
        ${input.admin?.email ?? "system"},
        ${input.action},
        ${input.entityType},
        ${input.entityId ?? null},
        ${input.summary},
        ${JSON.stringify(input.metadata ?? {})},
        ${ip}
      )
    `;
  } catch (err) {
    console.error("audit log failed:", err);
  }
}

/** Deletes audit rows older than `days` (log-retention policy). Returns count. */
export async function pruneAuditLogs(days: number): Promise<number> {
  const rows = (await requireSql()`
    with deleted as (
      delete from audit_logs where created_at < now() - make_interval(days => ${days}) returning 1
    ) select count(*)::int as n from deleted
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

/**
 * Counts recent failed admin logins for an email *or* source IP — the basis for
 * brute-force lockout. Best-effort: returns 0 if the audit table is unreachable.
 */
export async function countRecentFailedLogins(
  email: string,
  ip: string | null,
  withinMinutes = 15,
): Promise<number> {
  try {
    const needle = `%${email.toLowerCase()}`;
    const rows = (await requireSql()`
      select count(*)::int as n from audit_logs
      where action = 'login_failed'
        and created_at > now() - make_interval(mins => ${withinMinutes})
        and (lower(summary) like ${needle} or (${ip}::text is not null and ip = ${ip}))
    `) as Array<{ n: number }>;
    return rows[0]?.n ?? 0;
  } catch (err) {
    console.error("failed-login count failed:", err);
    return 0;
  }
}

export async function getAuditLogs(opts: {
  limit?: number;
  offset?: number;
  entityType?: string;
  search?: string;
} = {}): Promise<{ rows: AuditLogEntry[]; total: number }> {
  const sql = requireSql();
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;
  const entityType = opts.entityType ?? null;
  const search = opts.search ? `%${opts.search}%` : null;

  const rows = (await sql`
    select id, admin_id, admin_email, action, entity_type, entity_id, summary, metadata, ip, created_at
    from audit_logs
    where (${entityType}::text is null or entity_type = ${entityType})
      and (${search}::text is null or summary ilike ${search} or admin_email ilike ${search})
    order by created_at desc
    limit ${limit} offset ${offset}
  `) as Array<Record<string, unknown>>;

  const totalRows = (await sql`
    select count(*)::int as n from audit_logs
    where (${entityType}::text is null or entity_type = ${entityType})
      and (${search}::text is null or summary ilike ${search} or admin_email ilike ${search})
  `) as Array<{ n: number }>;

  return {
    rows: rows.map((r) => ({
      id: Number(r.id),
      adminId: (r.admin_id as string) ?? null,
      adminEmail: r.admin_email as string,
      action: r.action as string,
      entityType: r.entity_type as string,
      entityId: (r.entity_id as string) ?? null,
      summary: r.summary as string,
      metadata: (r.metadata as Record<string, unknown>) ?? {},
      ip: (r.ip as string) ?? null,
      createdAt: r.created_at as string,
    })),
    total: totalRows[0]?.n ?? 0,
  };
}
