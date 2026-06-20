import { cookies } from "next/headers";

/**
 * Cookie-backed session + per-user registration store. No demo users: every
 * dashboard surface derives from the person who actually signed up, and a new
 * account starts completely empty. Swaps cleanly for a DB-backed session when
 * real auth lands; callers only ever touch these functions.
 */

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
  const session = parse<Session>(jar.get(SESSION_COOKIE)?.value);
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
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
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
  return parse<StoredRegistration[]>(jar.get(REGS_COOKIE)?.value) ?? [];
}

/** Only callable from Server Actions / Route Handlers. */
export async function addStoredRegistration(eventSlug: string, status: StoredRegistration["status"]) {
  const jar = await cookies();
  const current = parse<StoredRegistration[]>(jar.get(REGS_COOKIE)?.value) ?? [];
  if (!current.some((r) => r.eventSlug === eventSlug)) {
    current.unshift({ eventSlug, registeredAt: new Date().toISOString(), status });
  }
  jar.set(REGS_COOKIE, JSON.stringify(current), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}
