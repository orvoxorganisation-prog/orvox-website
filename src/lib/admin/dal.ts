import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { resolveAdminFromCookie } from "./session";
import { can, type Permission } from "./rbac";
import type { AdminUser, AdminRole } from "./types";

/**
 * Data Access Layer for admin auth. The single place that resolves "who is the
 * current admin". Cached per-request so layout + page + actions share one DB
 * lookup. Every protected surface calls requireAdmin() / requirePermission().
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  try {
    const row = await resolveAdminFromCookie();
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as AdminRole,
      status: row.status as AdminUser["status"],
      lastLoginAt: null,
      createdAt: "",
    };
  } catch {
    // DB unreachable / not configured — treat as signed out.
    return null;
  }
});

/** Returns the admin or redirects to the login page. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Like requireAdmin but also enforces a permission; redirects to /admin/403. */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (!can(admin.role, permission)) redirect("/admin/403");
  return admin;
}

/** Non-throwing permission check for conditional UI. */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin ? can(admin.role, permission) : false;
}
