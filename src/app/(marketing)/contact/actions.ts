"use server";

import { contactSchema, type ContactResult } from "@/lib/validations/contact";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Handles a contact submission. Validates server-side; in production this would
 * forward to an inbox or ticketing system. Returns a typed result for the form.
 */
export async function sendContactMessage(raw: unknown): Promise<ContactResult> {
  const limit = await rateLimit(`contact:${await clientIp()}`, 5, 600);
  if (!limit.ok) {
    return { ok: false, message: "You're sending messages too quickly. Please wait a moment." };
  }
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Some details need another look." };
  }
  // Simulate delivery latency for honest pending UI.
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}
