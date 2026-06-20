"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { adminUserSchema } from "@/lib/admin/validation";
import { logAudit } from "@/lib/admin/audit";
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  setAdminStatus,
  deleteAdmin,
  getAdminById,
} from "@/lib/admin/data/admins";
import type { AdminRole } from "@/lib/admin/types";

export interface AdminFormResult {
  ok: boolean;
  error?: string;
}

export async function createAdminAction(_prev: AdminFormResult, fd: FormData): Promise<AdminFormResult> {
  const actor = await requirePermission("admins:manage");
  const parsed = adminUserSchema.safeParse({
    email: fd.get("email"),
    name: fd.get("name"),
    role: fd.get("role"),
    password: fd.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (!parsed.data.password) return { ok: false, error: "A password is required for new admins." };

  const existing = (await listAdmins()).find((a) => a.email === parsed.data.email.toLowerCase());
  if (existing) return { ok: false, error: "An admin with that email already exists." };

  const id = await createAdmin({ email: parsed.data.email, name: parsed.data.name, role: parsed.data.role, password: parsed.data.password });
  await logAudit({ admin: actor, action: "create", entityType: "admin", entityId: id, summary: `Created admin ${parsed.data.email} (${parsed.data.role})` });
  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function updateAdminAction(_prev: AdminFormResult, fd: FormData): Promise<AdminFormResult> {
  const actor = await requirePermission("admins:manage");
  const adminId = String(fd.get("id"));
  const target = await getAdminById(adminId);
  if (!target) return { ok: false, error: "Admin not found." };

  const password = (fd.get("password") as string) || undefined;
  const parsed = adminUserSchema.safeParse({
    email: target.email,
    name: fd.get("name"),
    role: fd.get("role"),
    password,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  // Don't allow demoting the last superadmin.
  if (target.role === "superadmin" && parsed.data.role !== "superadmin") {
    const supers = (await listAdmins()).filter((a) => a.role === "superadmin");
    if (supers.length <= 1) return { ok: false, error: "You can't demote the last super admin." };
  }

  await updateAdmin(adminId, { name: parsed.data.name, role: parsed.data.role as AdminRole, password });
  await logAudit({ admin: actor, action: "update", entityType: "admin", entityId: adminId, summary: `Updated admin ${target.email}${password ? " (password reset)" : ""}` });
  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function setAdminStatusAction(fd: FormData): Promise<void> {
  const actor = await requirePermission("admins:manage");
  const adminId = String(fd.get("id"));
  const status = String(fd.get("status")) as "active" | "suspended";
  if (adminId === actor.id) return; // can't suspend yourself
  const target = await getAdminById(adminId);
  if (target?.role === "superadmin" && status === "suspended") {
    const activeSupers = (await listAdmins()).filter((a) => a.role === "superadmin" && a.status === "active");
    if (activeSupers.length <= 1) return;
  }
  await setAdminStatus(adminId, status);
  await logAudit({ admin: actor, action: status === "suspended" ? "suspend" : "activate", entityType: "admin", entityId: adminId, summary: `${status === "suspended" ? "Suspended" : "Activated"} admin ${target?.email ?? adminId}` });
  revalidatePath("/admin/admins");
}

export async function deleteAdminAction(fd: FormData): Promise<void> {
  const actor = await requirePermission("admins:manage");
  const adminId = String(fd.get("id"));
  if (adminId === actor.id) return; // can't delete yourself
  const target = await getAdminById(adminId);
  if (target?.role === "superadmin") {
    const supers = (await listAdmins()).filter((a) => a.role === "superadmin");
    if (supers.length <= 1) return; // never delete the last superadmin
  }
  await deleteAdmin(adminId);
  await logAudit({ admin: actor, action: "delete", entityType: "admin", entityId: adminId, summary: `Deleted admin ${target?.email ?? adminId}` });
  revalidatePath("/admin/admins");
}
