"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { logAudit } from "@/lib/admin/audit";
import { setFlag } from "@/lib/admin/data/cms";
import { setEventFeatured } from "@/lib/admin/data/events";

export async function toggleFlagAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("controls:write");
  const key = String(fd.get("key"));
  const enabled = fd.get("enabled") === "true";
  await setFlag(key, enabled);
  await logAudit({ admin, action: enabled ? "enable" : "disable", entityType: "flag", entityId: key, summary: `${enabled ? "Enabled" : "Disabled"} ${key}` });
  revalidatePath("/", "layout");
}

export async function toggleEventFeaturedAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("controls:write");
  const eventId = String(fd.get("key"));
  const enabled = fd.get("enabled") === "true";
  await setEventFeatured(eventId, enabled);
  await logAudit({ admin, action: enabled ? "feature" : "unfeature", entityType: "event", entityId: eventId, summary: `${enabled ? "Featured" : "Unfeatured"} event ${eventId}` });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}
