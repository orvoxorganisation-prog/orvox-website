"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { navItemSchema } from "@/lib/admin/validation";
import { logAudit } from "@/lib/admin/audit";
import { createNavItem, updateNavItem, deleteNavItem } from "@/lib/admin/data/cms";

export interface NavResult {
  ok: boolean;
  error?: string;
}

function read(fd: FormData) {
  return navItemSchema.safeParse({
    location: fd.get("location"),
    groupLabel: fd.get("groupLabel") ?? "",
    label: fd.get("label"),
    href: fd.get("href"),
    position: fd.get("position") || 0,
    enabled: fd.get("enabled") === "on" || fd.get("enabled") === "true",
  });
}

export async function createNavAction(_prev: NavResult, fd: FormData): Promise<NavResult> {
  const admin = await requirePermission("content:write");
  const parsed = read(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createNavItem(parsed.data);
  await logAudit({ admin, action: "create", entityType: "nav", summary: `Added ${parsed.data.location} link “${parsed.data.label}”` });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateNavAction(_prev: NavResult, fd: FormData): Promise<NavResult> {
  const admin = await requirePermission("content:write");
  const id = Number(fd.get("id"));
  const parsed = read(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateNavItem(id, parsed.data);
  await logAudit({ admin, action: "update", entityType: "nav", entityId: String(id), summary: `Updated nav link #${id}` });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteNavAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("content:write");
  const id = Number(fd.get("id"));
  await deleteNavItem(id);
  await logAudit({ admin, action: "delete", entityType: "nav", entityId: String(id), summary: `Deleted nav link #${id}` });
  revalidatePath("/", "layout");
}
