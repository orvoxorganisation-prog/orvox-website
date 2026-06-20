"use server";

import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { createSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db/client";
import { dbUpsertAccount, dbGetAccountStatus } from "@/lib/db/public";

interface AuthResult {
  ok: boolean;
  message?: string;
}

export async function signup(raw: unknown): Promise<AuthResult> {
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Some details need another look." };
  const { name, email, school } = parsed.data;
  if (isDbConfigured) {
    try {
      const status = await dbGetAccountStatus(email);
      if (status === "banned") return { ok: false, message: "This account has been suspended." };
      await dbUpsertAccount({ name, email, school });
    } catch (err) {
      console.error("signup: account upsert failed:", err);
    }
  }
  await createSession({ name, email, school });
  return { ok: true };
}

export async function login(raw: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check your email and password." };
  const { email } = parsed.data;
  // No credential store yet: a login starts a session for that email. The
  // display name falls back to the email's local part until the profile is set.
  const local = email.split("@")[0] ?? "speaker";
  const name = local.charAt(0).toUpperCase() + local.slice(1);
  if (isDbConfigured) {
    try {
      const status = await dbGetAccountStatus(email);
      if (status === "banned") return { ok: false, message: "This account has been suspended." };
      await dbUpsertAccount({ name, email });
    } catch (err) {
      console.error("login: account upsert failed:", err);
    }
  }
  await createSession({ name, email });
  return { ok: true };
}
