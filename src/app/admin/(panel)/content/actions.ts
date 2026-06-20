"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { logAudit } from "@/lib/admin/audit";
import { updateContentBlock, getContentBlock } from "@/lib/admin/data/cms";

export interface ContentResult {
  ok: boolean;
  error?: string;
}

export async function updateContentBlockAction(_prev: ContentResult, fd: FormData): Promise<ContentResult> {
  const admin = await requirePermission("content:write");
  const key = String(fd.get("key"));
  const existing = await getContentBlock(key);
  if (!existing) return { ok: false, error: "Content block not found." };

  // Reconstruct the value object from `field:<subkey>` inputs, preserving the
  // original key set so we never drop fields the editor didn't render.
  const value: Record<string, unknown> = { ...existing.value };
  for (const [name, raw] of fd.entries()) {
    if (name.startsWith("field:")) value[name.slice(6)] = String(raw);
  }

  await updateContentBlock(key, value, admin.email);
  await logAudit({ admin, action: "update", entityType: "content", entityId: key, summary: `Edited content block “${existing.label}”` });
  revalidatePath("/", "layout");
  return { ok: true };
}
