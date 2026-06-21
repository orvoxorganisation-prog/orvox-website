"use server";

import { redirect } from "next/navigation";
import { getSession, clearSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db/client";
import { dbDeleteAccount } from "@/lib/db/public";

/**
 * Deletes the signed-in user's account and all associated registrations
 * (GDPR erasure), then clears the session. Irreversible.
 */
export async function deleteMyAccount(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");

  if (isDbConfigured) {
    try {
      await dbDeleteAccount(session.email);
    } catch (err) {
      console.error("deleteMyAccount failed:", err);
      // Still clear the session below; surface nothing sensitive to the client.
    }
  }
  await clearSession();
  redirect("/?deleted=1");
}
