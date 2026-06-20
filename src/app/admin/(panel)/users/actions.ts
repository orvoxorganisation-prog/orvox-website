"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { logAudit } from "@/lib/admin/audit";
import { setAccountStatus, deleteAccount } from "@/lib/admin/data/accounts";

export async function setUserStatusAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("users:write");
  const accountId = String(fd.get("id"));
  const status = String(fd.get("status")) as "active" | "banned";
  await setAccountStatus(accountId, status);
  await logAudit({ admin, action: status === "banned" ? "ban" : "unban", entityType: "account", entityId: accountId, summary: `${status === "banned" ? "Banned" : "Reinstated"} user ${accountId}` });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("users:write");
  const accountId = String(fd.get("id"));
  await deleteAccount(accountId);
  await logAudit({ admin, action: "delete", entityType: "account", entityId: accountId, summary: `Deleted user ${accountId} and their registrations` });
  revalidatePath("/admin/users");
}
