import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cookie-backed session + per-user registration store. No demo users: every
 * dashboard surface derives from the person who actually signed up, and a new
 * account starts completely empty. Swaps cleanly for a DB-backed session when
 * real auth lands; callers only ever touch these functions.
 *
 * Cookie values are HMAC-signed with SESSION_SECRET so the client cannot tamper
 * with them (e.g. swap the email to impersonate another account). An unsigned or
 * mis-signed cookie is treated as no session.
 */
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s === "change-me") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set to a strong random value in production.");
    }
    return "dev-insecure-session-secret"; // dev fallback only
  }
  return s;
}

/** `<payload>.<hmac>` where payload is the raw cookie string. */
function sign(payload: string): string {
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

/** Returns the verified payload, or null if the signature doesn't match. */
function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const i = signed.lastIndexOf(".");
  if (i < 0) return null;
  const payload = signed.slice(0, i);
  const mac = signed.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export interface Session {
  name: string;
  email: string;
  school?: string;
  joinedAt: string; // ISO
}

export interface StoredRegistration {
  eventSlug: string;
  registeredAt: string; // ISO
  status: "confirmed" | "waitlist";
}

const SESSION_COOKIE = "orvox_session";
const REGS_COOKIE = "orvox_registrations";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function parse<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const session = parse<Session>(unsign(jar.get(SESSION_COOKIE)?.value) ?? undefined);
  return session && session.email ? session : null;
}

/** Only callable from Server Actions / Route Handlers. */
export async function createSession(input: { name: string; email: string; school?: string }) {
  const jar = await cookies();
  const session: Session = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    school: input.school?.trim() || undefined,
    joinedAt: new Date().toISOString(),
  };
  jar.set(SESSION_COOKIE, sign(JSON.stringify(session)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(REGS_COOKIE);
}

export async function getStoredRegistrations(): Promise<StoredRegistration[]> {
  const jar = await cookies();
  return parse<StoredRegistration[]>(unsign(jar.get(REGS_COOKIE)?.value) ?? undefined) ?? [];
}

/** Only callable from Server Actions / Route Handlers. */
export async function addStoredRegistration(eventSlug: string, status: StoredRegistration["status"]) {
  const jar = await cookies();
  const current = parse<StoredRegistration[]>(unsign(jar.get(REGS_COOKIE)?.value) ?? undefined) ?? [];
  if (!current.some((r) => r.eventSlug === eventSlug)) {
    current.unshift({ eventSlug, registeredAt: new Date().toISOString(), status });
  }
  jar.set(REGS_COOKIE, sign(JSON.stringify(current)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}
