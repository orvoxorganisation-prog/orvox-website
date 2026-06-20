import "server-only";
import { requireSql } from "@/lib/db/client";
import { hashPassword } from "../password";
import { id as genId } from "../util";
import type { AdminUser, AdminRole } from "../types";

function rowToAdmin(r: Record<string, unknown>): AdminUser {
  return {
    id: r.id as string,
    email: r.email as string,
    name: r.name as string,
    role: r.role as AdminRole,
    status: r.status as AdminUser["status"],
    lastLoginAt: r.last_login_at ? (r.last_login_at instanceof Date ? r.last_login_at.toISOString() : String(r.last_login_at)) : null,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  };
}

export async function listAdmins(): Promise<AdminUser[]> {
  const rows = (await requireSql()`select * from admin_users order by created_at asc`) as Array<Record<string, unknown>>;
  return rows.map(rowToAdmin);
}

export async function getAdminById(adminId: string): Promise<AdminUser | null> {
  const rows = (await requireSql()`select * from admin_users where id = ${adminId} limit 1`) as Array<Record<string, unknown>>;
  return rows[0] ? rowToAdmin(rows[0]) : null;
}

/** Includes password_hash — only for the login flow. */
export async function getAdminAuthByEmail(email: string): Promise<(AdminUser & { passwordHash: string }) | null> {
  const rows = (await requireSql()`select * from admin_users where email = ${email.toLowerCase()} limit 1`) as Array<Record<string, unknown>>;
  if (!rows[0]) return null;
  return { ...rowToAdmin(rows[0]), passwordHash: rows[0].password_hash as string };
}

export async function createAdmin(input: { email: string; name: string; role: AdminRole; password: string }): Promise<string> {
  const sql = requireSql();
  const adminId = genId("adm");
  const hash = await hashPassword(input.password);
  await sql`
    insert into admin_users (id, email, name, password_hash, role, status)
    values (${adminId}, ${input.email.toLowerCase()}, ${input.name}, ${hash}, ${input.role}, 'active')
  `;
  return adminId;
}

export async function updateAdmin(adminId: string, input: { name: string; role: AdminRole; password?: string }): Promise<void> {
  const sql = requireSql();
  if (input.password) {
    const hash = await hashPassword(input.password);
    await sql`update admin_users set name = ${input.name}, role = ${input.role}, password_hash = ${hash}, updated_at = now() where id = ${adminId}`;
  } else {
    await sql`update admin_users set name = ${input.name}, role = ${input.role}, updated_at = now() where id = ${adminId}`;
  }
}

export async function setAdminStatus(adminId: string, status: "active" | "suspended"): Promise<void> {
  await requireSql()`update admin_users set status = ${status}, updated_at = now() where id = ${adminId}`;
}

export async function deleteAdmin(adminId: string): Promise<void> {
  await requireSql()`delete from admin_users where id = ${adminId}`;
}

export async function recordAdminLogin(adminId: string): Promise<void> {
  await requireSql()`update admin_users set last_login_at = now() where id = ${adminId}`;
}

export async function countAdmins(): Promise<number> {
  const rows = (await requireSql()`select count(*)::int as n from admin_users`) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}
