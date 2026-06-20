"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { mediaUrlSchema } from "@/lib/admin/validation";
import { logAudit } from "@/lib/admin/audit";
import { id as genId } from "@/lib/admin/util";
import { createMedia, updateMedia, deleteMedia, getMedia } from "@/lib/admin/data/media";

export interface MediaResult {
  ok: boolean;
  error?: string;
}

export async function addMediaByUrlAction(_prev: MediaResult, fd: FormData): Promise<MediaResult> {
  const admin = await requirePermission("media:write");
  const parsed = mediaUrlSchema.safeParse({
    url: fd.get("url"),
    filename: fd.get("filename"),
    alt: fd.get("alt") ?? "",
    folder: fd.get("folder") || "general",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createMedia({
    id: genId("med"),
    filename: parsed.data.filename,
    url: parsed.data.url,
    alt: parsed.data.alt,
    folder: parsed.data.folder,
    mime: "",
    sizeBytes: 0,
    uploadedBy: admin.email,
  });
  await logAudit({ admin, action: "create", entityType: "media", summary: `Added media “${parsed.data.filename}” by URL` });
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function updateMediaAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("media:write");
  const mediaId = String(fd.get("id"));
  await updateMedia(mediaId, { alt: String(fd.get("alt") ?? ""), folder: String(fd.get("folder") || "general") });
  await logAudit({ admin, action: "update", entityType: "media", entityId: mediaId, summary: `Updated media ${mediaId}` });
  revalidatePath("/admin/media");
}

export async function deleteMediaAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("media:delete");
  const mediaId = String(fd.get("id"));
  const item = await getMedia(mediaId);
  // Best-effort removal from Vercel Blob storage when applicable.
  if (item && process.env.BLOB_READ_WRITE_TOKEN && item.url.includes("blob.vercel-storage.com")) {
    try {
      const { del } = await import("@vercel/blob");
      await del(item.url);
    } catch (err) {
      console.error("blob delete failed:", err);
    }
  }
  await deleteMedia(mediaId);
  await logAudit({ admin, action: "delete", entityType: "media", entityId: mediaId, summary: `Deleted media ${mediaId}` });
  revalidatePath("/admin/media");
}
