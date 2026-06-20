"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { logAudit } from "@/lib/admin/audit";
import { updateRegistrationStatus, deleteRegistration } from "@/lib/admin/data/registrations";

export async function setRegistrationStatusAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("registrations:write");
  const regId = Number(fd.get("id"));
  const status = String(fd.get("status")) as "confirmed" | "waitlist";
  await updateRegistrationStatus(regId, status);
  await logAudit({ admin, action: "update", entityType: "registration", entityId: String(regId), summary: `Set registration #${regId} to ${status}` });
  revalidatePath("/admin/registrations");
}

export async function deleteRegistrationAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("registrations:write");
  const regId = Number(fd.get("id"));
  await deleteRegistration(regId);
  await logAudit({ admin, action: "delete", entityType: "registration", entityId: String(regId), summary: `Deleted registration #${regId}` });
  revalidatePath("/admin/registrations");
}
