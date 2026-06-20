"use server";

import { contactSchema, type ContactResult } from "@/lib/validations/contact";

/**
 * Handles a contact submission. Validates server-side; in production this would
 * forward to an inbox or ticketing system. Returns a typed result for the form.
 */
export async function sendContactMessage(raw: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Some details need another look." };
  }
  // Simulate delivery latency for honest pending UI.
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}
