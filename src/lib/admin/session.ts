import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { requireSql } from "@/lib/db/client";

/**
 * Database-backed admin sessions. The browser holds only an opaque random
 * token (httpOnly cookie); the database stores its SHA-256 hash, so a leaked
 * DB row can't be replayed as a cookie. Real validation happens in the DAL
 * (Node runtime) — the proxy only does an optimistic cookie-presence check.
 */
export const ADMIN_COOKIE = "orvox_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(
  adminId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<void> {
  const sql = requireSql();
  const token = randomBytes(32).toString("hex");
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await sql`
    insert into admin_sessions (id, admin_id, expires_at, ip, user_agent)
    values (${id}, ${adminId}, ${expiresAt.toISOString()}, ${meta.ip ?? null}, ${meta.userAgent ?? null})
  `;

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/** Returns the admin row for the current cookie, or null. Validates expiry. */
export async function resolveAdminFromCookie(): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
} | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const sql = requireSql();
  const rows = (await sql`
    select a.id, a.email, a.name, a.role, a.status, s.expires_at
    from admin_sessions s
    join admin_users a on a.id = s.admin_id
    where s.id = ${hashToken(token)}
    limit 1
  `) as Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    expires_at: string;
  }>;

  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    // expired — best-effort cleanup
    await sql`delete from admin_sessions where id = ${hashToken(token)}`;
    return null;
  }
  if (row.status !== "active") return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role, status: row.status };
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) {
    try {
      await requireSql()`delete from admin_sessions where id = ${hashToken(token)}`;
    } catch {
      /* ignore */
    }
  }
  jar.delete(ADMIN_COOKIE);
}

/** Periodic-safe cleanup of expired sessions (called opportunistically). */
export async function pruneExpiredSessions(): Promise<void> {
  try {
    await requireSql()`delete from admin_sessions where expires_at < now()`;
  } catch {
    /* ignore */
  }
}
