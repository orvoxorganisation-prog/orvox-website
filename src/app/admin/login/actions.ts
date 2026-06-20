"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminLoginSchema } from "@/lib/admin/validation";
import { getAdminAuthByEmail, recordAdminLogin } from "@/lib/admin/data/admins";
import { verifyPassword } from "@/lib/admin/password";
import { createAdminSession } from "@/lib/admin/session";
import { logAudit } from "@/lib/admin/audit";

export interface LoginState {
  error?: string;
}

function safeRedirect(from: string | null): string {
  if (from && from.startsWith("/admin") && from !== "/admin/login") return from;
  return "/admin";
}

export async function adminLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter your email and password." };

  const admin = await getAdminAuthByEmail(parsed.data.email);
  // Always run a verification to keep timing roughly constant.
  const valid = admin
    ? await verifyPassword(parsed.data.password, admin.passwordHash)
    : await verifyPassword(parsed.data.password, "scrypt$00$00");

  if (!admin || admin.status !== "active" || !valid) {
    await logAudit({
      admin: null,
      action: "login_failed",
      entityType: "session",
      summary: `Failed admin login for ${parsed.data.email}`,
    });
    return { error: "Invalid email or password." };
  }

  const h = await headers();
  await createAdminSession(admin.id, {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
    userAgent: h.get("user-agent"),
  });
  await recordAdminLogin(admin.id);
  await logAudit({ admin, action: "login", entityType: "session", summary: `${admin.email} logged in` });

  redirect(safeRedirect(formData.get("from") as string | null));
}
