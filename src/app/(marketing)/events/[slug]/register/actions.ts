"use server";

import { registrationSchema, type RegistrationResult } from "@/lib/validations/registration";
import { getEventBySlug } from "@/lib/repo";
import { getSession, addStoredRegistration } from "@/lib/session";
import { sql } from "@/lib/db/client";
import { dbUpsertAccount } from "@/lib/db/public";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** Confirmation code like ORV-7Q4K-2P. */
function confirmationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `ORV-${pick(4)}-${pick(2)}`;
}

/**
 * Registers a participant for an event. Validates on the server, persists to
 * Neon when DATABASE_URL is set, and always returns a confirmation code so the
 * flow completes in development without a database.
 */
export async function registerForEvent(
  slug: string,
  raw: unknown,
): Promise<RegistrationResult> {
  const limit = await rateLimit(`register:${await clientIp()}`, 10, 600);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please wait a moment and try again." };

  const event = await getEventBySlug(slug);
  if (!event) return { ok: false, message: "That event no longer exists." };

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Some details need another look." };
  }

  const data = parsed.data;
  const confirmationId = confirmationCode();
  const session = await getSession();
  const email = (session?.email ?? data.email).trim().toLowerCase();
  const full = event.seatsTotal - event.seatsFilled <= 0;
  const status = full ? "waitlist" : "confirmed";

  if (sql) {
    try {
      // Ensure the participant account exists first (FK target) so admins can
      // see and manage every registrant under User Management.
      const accountId = await dbUpsertAccount({ email, name: data.fullName, school: data.school });
      await sql`
        insert into registrations
          (account_id, event_slug, status, full_name, email, phone, school, category, motivation)
        values
          (${accountId}, ${slug}, ${status}, ${data.fullName}, ${email},
           ${data.phone || null}, ${data.school}, ${data.category}, ${data.motivation || null})
        on conflict (account_id, event_slug) do update set
          status = excluded.status,
          full_name = excluded.full_name,
          email = excluded.email,
          phone = excluded.phone,
          school = excluded.school,
          category = excluded.category,
          motivation = excluded.motivation
      `;
      // Reflect a confirmed seat in the event's filled count (cap at total).
      if (status === "confirmed") {
        await sql`
          update events set seats_filled = least(seats_total, seats_filled + 1), updated_at = now()
          where slug = ${slug}
        `;
      }
    } catch (err) {
      console.error("registerForEvent: DB write failed:", err);
      return { ok: false, message: "We couldn't save that. Try again in a moment." };
    }
  }

  // Persist to the user's session store so the dashboard reflects this seat.
  await addStoredRegistration(slug, status);

  return { ok: true, confirmationId };
}
