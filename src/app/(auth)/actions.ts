"use server";

import {
  loginSchema,
  signupSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { createSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { isDbConfigured } from "@/lib/db/client";
import {
  dbUpsertAccount,
  dbGetAccountAuth,
  dbSetAccountPassword,
  dbSetEmailVerified,
} from "@/lib/db/public";
import { createAuthToken, consumeAuthToken } from "@/lib/auth/tokens";
import { sendAuthEmail } from "@/lib/auth/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site";

interface AuthResult {
  ok: boolean;
  message?: string;
}

/** Email verification is opt-in (off until a mail provider is configured), so
 *  the app never locks users out without a way to send the verification link. */
function verificationRequired(): boolean {
  return process.env.REQUIRE_EMAIL_VERIFICATION === "true";
}

async function sendVerification(email: string, name: string): Promise<void> {
  const token = await createAuthToken("verify", email);
  const url = `${siteConfig.url}/verify?token=${encodeURIComponent(token)}`;
  await sendAuthEmail({
    to: email,
    subject: "Verify your ORVOX email",
    heading: `Welcome, ${name}`,
    body: "Confirm this email address to activate your ORVOX account.",
    actionLabel: "Verify email",
    actionUrl: url,
  });
}

export async function signup(raw: unknown): Promise<AuthResult> {
  const ip = await clientIp();
  if (!(await rateLimit(`signup:${ip}`, 5, 3600)).ok) {
    return { ok: false, message: "Too many sign-up attempts. Please try again later." };
  }

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Some details need another look." };
  const { name, email, password, school } = parsed.data;

  if (!isDbConfigured) {
    // Dev convenience only (no credential store without a DB).
    await createSession({ name, email, school });
    return { ok: true };
  }

  try {
    const existing = await dbGetAccountAuth(email);
    if (existing?.status === "banned") return { ok: false, message: "This account has been suspended." };
    // An account may already exist passwordless (created via event registration).
    // Allow claiming it, but never overwrite an account that already has a password.
    if (existing?.passwordHash) {
      return { ok: false, message: "An account with that email already exists. Please log in." };
    }
    await dbUpsertAccount({ name, email, school });
    await dbSetAccountPassword(email, await hashPassword(password));
    await sendVerification(email, name);
  } catch (err) {
    console.error("signup: account creation failed:", err);
    return { ok: false, message: "We couldn't create your account. Try again." };
  }

  if (verificationRequired()) {
    // Don't sign them in until they verify.
    return { ok: true, message: "Check your email to verify your account before signing in." };
  }
  await createSession({ name, email, school });
  return { ok: true };
}

export async function login(raw: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check your email and password." };
  const { email, password } = parsed.data;

  const ip = await clientIp();
  // Throttle by IP and by email to slow credential stuffing / brute force.
  const limited = !(await rateLimit(`login:${ip}`, 15, 900)).ok || !(await rateLimit(`login:${email}`, 10, 900)).ok;
  if (limited) return { ok: false, message: "Too many attempts. Please wait a few minutes and try again." };

  if (!isDbConfigured) {
    return { ok: false, message: "Sign-in is unavailable right now. Please try again later." };
  }

  let account: Awaited<ReturnType<typeof dbGetAccountAuth>> = null;
  try {
    account = await dbGetAccountAuth(email);
  } catch (err) {
    console.error("login: account lookup failed:", err);
    return { ok: false, message: "Sign-in is unavailable right now. Please try again later." };
  }

  // Verify against the stored hash (or a dummy, to keep timing ~constant and
  // avoid leaking whether the email exists / has a password set).
  const valid = await verifyPassword(password, account?.passwordHash ?? "scrypt$00$00");

  if (!account || !account.passwordHash || !valid) {
    return { ok: false, message: "Invalid email or password." };
  }
  if (account.status === "banned") return { ok: false, message: "This account has been suspended." };
  if (verificationRequired() && !account.emailVerified) {
    return { ok: false, message: "Please verify your email first. Check your inbox or request a new link." };
  }

  await createSession({ name: account.name, email, school: account.school ?? undefined });
  return { ok: true };
}

/** Step 1 of reset: always returns ok (no account enumeration). */
export async function requestPasswordReset(raw: unknown): Promise<AuthResult> {
  const ip = await clientIp();
  if (!(await rateLimit(`reset-req:${ip}`, 5, 3600)).ok) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }
  const parsed = requestResetSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Enter a valid email." };
  const { email } = parsed.data;

  if (isDbConfigured) {
    try {
      const account = await dbGetAccountAuth(email);
      // Only send to accounts that actually have a password set.
      if (account?.passwordHash && account.status !== "banned") {
        const token = await createAuthToken("reset", email);
        const url = `${siteConfig.url}/reset?token=${encodeURIComponent(token)}`;
        await sendAuthEmail({
          to: email,
          subject: "Reset your ORVOX password",
          heading: "Password reset",
          body: "Use the link below to set a new password. It expires in 30 minutes.",
          actionLabel: "Reset password",
          actionUrl: url,
        });
      }
    } catch (err) {
      console.error("requestPasswordReset failed:", err);
    }
  }
  // Uniform response regardless of whether the email exists.
  return { ok: true, message: "If that email has an account, a reset link is on its way." };
}

/** Step 2 of reset: consume the token and set a new password. */
export async function resetPassword(raw: unknown): Promise<AuthResult> {
  const ip = await clientIp();
  if (!(await rateLimit(`reset:${ip}`, 10, 900)).ok) {
    return { ok: false, message: "Too many attempts. Please wait and try again." };
  }
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your new password." };
  if (!isDbConfigured) return { ok: false, message: "Password reset is unavailable right now." };

  const { token, password } = parsed.data;
  try {
    const accountId = await consumeAuthToken("reset", token);
    if (!accountId) return { ok: false, message: "That reset link is invalid or has expired." };
    await dbSetAccountPassword(accountId, await hashPassword(password));
    // Resetting via an emailed link also proves control of the address.
    await dbSetEmailVerified(accountId);
    const account = await dbGetAccountAuth(accountId);
    await createSession({ name: account?.name ?? accountId, email: accountId, school: account?.school ?? undefined });
    return { ok: true, message: "Your password has been updated." };
  } catch (err) {
    console.error("resetPassword failed:", err);
    return { ok: false, message: "We couldn't reset your password. Try again." };
  }
}

/** Re-send a verification email (uniform response, rate limited). */
export async function resendVerification(raw: unknown): Promise<AuthResult> {
  const ip = await clientIp();
  if (!(await rateLimit(`verify-resend:${ip}`, 5, 3600)).ok) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }
  const parsed = requestResetSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Enter a valid email." };

  if (isDbConfigured) {
    try {
      const account = await dbGetAccountAuth(parsed.data.email);
      if (account && !account.emailVerified && account.status !== "banned") {
        await sendVerification(parsed.data.email, account.name);
      }
    } catch (err) {
      console.error("resendVerification failed:", err);
    }
  }
  return { ok: true, message: "If that account needs verifying, a new link is on its way." };
}
