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

  let admin: Awaited<ReturnType<typeof getAdminAuthByEmail>>;
  try {
    admin = await getAdminAuthByEmail(parsed.data.email);
  } catch (err) {
    console.error("Admin login DB error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("DATABASE_URL")) {
      return { error: "Database not configured. Set DATABASE_URL in Vercel environment variables." };
    }
    return { error: "Database connection failed. Check your DATABASE_URL environment variable." };
  }

  // Always run a verification to keep timing roughly constant.
  let valid = false;
  try {
    valid = admin
      ? await verifyPassword(parsed.data.password, admin.passwordHash)
      : await verifyPassword(parsed.data.password, "scrypt$00$00");
  } catch (err) {
    console.error("Password verification error:", err);
    return { error: "Authentication error. Please try again." };
  }

  if (!admin || admin.status !== "active" || !valid) {
    try {
      await logAudit({
        admin: null,
        action: "login_failed",
        entityType: "session",
        summary: `Failed admin login for ${parsed.data.email}`,
      });
    } catch { /* audit failures never block login */ }
    return { error: "Invalid email or password." };
  }

  try {
    const h = await headers();
    await createAdminSession(admin.id, {
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
      userAgent: h.get("user-agent"),
    });
    await recordAdminLogin(admin.id);
    await logAudit({ admin, action: "login", entityType: "session", summary: `${admin.email} logged in` });
  } catch (err) {
    console.error("Session creation error:", err);
    return { error: "Failed to create session. Please try again." };
  }

  redirect(safeRedirect(formData.get("from") as string | null));
}
