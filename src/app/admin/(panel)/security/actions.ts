"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/dal";
import { getAdminMfa, setAdminMfaSecret, setAdminMfaEnabled, getAdminAuthByEmail } from "@/lib/admin/data/admins";
import { verifyPassword } from "@/lib/admin/password";
import { generateTotpSecret, otpauthUri, verifyTotp } from "@/lib/admin/totp";
import { logAudit } from "@/lib/admin/audit";

export interface MfaResult {
  ok: boolean;
  error?: string;
}

/** Generates a fresh (pending) TOTP secret and returns enrollment details. */
export async function beginMfaSetup(): Promise<{ secret: string; uri: string }> {
  const admin = await requireAdmin();
  const secret = generateTotpSecret();
  await setAdminMfaSecret(admin.id, secret); // stored as pending (mfa_enabled stays false)
  return { secret, uri: otpauthUri(secret, admin.email) };
}

/** Confirms enrollment: the entered code must validate against the pending secret. */
export async function confirmMfaAction(_prev: MfaResult, fd: FormData): Promise<MfaResult> {
  const admin = await requireAdmin();
  const code = String(fd.get("code") ?? "");
  const { secret } = await getAdminMfa(admin.id);
  if (!secret) return { ok: false, error: "Start the setup again — no pending secret found." };
  if (!verifyTotp(secret, code)) return { ok: false, error: "That code isn't valid. Check your authenticator and try again." };
  await setAdminMfaEnabled(admin.id, true);
  await logAudit({ admin, action: "mfa_enable", entityType: "admin", entityId: admin.id, summary: `${admin.email} enabled 2FA` });
  revalidatePath("/admin/security");
  return { ok: true };
}

/** Disables MFA. Requires the current password to confirm. */
export async function disableMfaAction(_prev: MfaResult, fd: FormData): Promise<MfaResult> {
  const admin = await requireAdmin();
  const password = String(fd.get("password") ?? "");
  const auth = await getAdminAuthByEmail(admin.email);
  if (!auth || !(await verifyPassword(password, auth.passwordHash))) {
    return { ok: false, error: "Password incorrect." };
  }
  await setAdminMfaEnabled(admin.id, false);
  await logAudit({ admin, action: "mfa_disable", entityType: "admin", entityId: admin.id, summary: `${admin.email} disabled 2FA` });
  revalidatePath("/admin/security");
  return { ok: true };
}
