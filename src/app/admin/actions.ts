"use server";

import { redirect } from "next/navigation";
import { destroyAdminSession } from "@/lib/admin/session";
import { getCurrentAdmin } from "@/lib/admin/dal";
import { logAudit } from "@/lib/admin/audit";

export async function adminLogout(): Promise<void> {
  const admin = await getCurrentAdmin();
  if (admin) {
    await logAudit({
      admin,
      action: "logout",
      entityType: "session",
      summary: `${admin.email} logged out`,
    });
  }
  await destroyAdminSession();
  redirect("/admin/login");
}
