"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { announcementSchema } from "@/lib/admin/validation";
import { logAudit } from "@/lib/admin/audit";
import { id as genId } from "@/lib/admin/util";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/admin/data/cms";

export interface AnnResult {
  ok: boolean;
  error?: string;
}

function read(fd: FormData) {
  return announcementSchema.safeParse({
    type: fd.get("type") || "reminder",
    title: fd.get("title"),
    body: fd.get("body") ?? "",
    href: fd.get("href") ?? "",
    published: fd.get("published") === "on" || fd.get("published") === "true",
  });
}

export async function createAnnouncementAction(_prev: AnnResult, fd: FormData): Promise<AnnResult> {
  const admin = await requirePermission("content:write");
  const parsed = read(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createAnnouncement({ id: genId("ann"), type: parsed.data.type, title: parsed.data.title, body: parsed.data.body, href: parsed.data.href || null, published: parsed.data.published });
  await logAudit({ admin, action: "create", entityType: "announcement", summary: `Posted announcement “${parsed.data.title}”` });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateAnnouncementAction(_prev: AnnResult, fd: FormData): Promise<AnnResult> {
  const admin = await requirePermission("content:write");
  const annId = String(fd.get("id"));
  const parsed = read(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateAnnouncement(annId, { type: parsed.data.type, title: parsed.data.title, body: parsed.data.body, href: parsed.data.href || null, published: parsed.data.published });
  await logAudit({ admin, action: "update", entityType: "announcement", entityId: annId, summary: `Updated announcement ${annId}` });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAnnouncementAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("content:write");
  const annId = String(fd.get("id"));
  await deleteAnnouncement(annId);
  await logAudit({ admin, action: "delete", entityType: "announcement", entityId: annId, summary: `Deleted announcement ${annId}` });
  revalidatePath("/", "layout");
}
