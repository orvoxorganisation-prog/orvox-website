import { NextResponse } from "next/server";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { dbSetEmailVerified, dbGetAccountAuth } from "@/lib/db/public";
import { createSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/** Email verification link target. Consumes the one-time token, marks the
 *  account verified, signs the user in, and lands them on the dashboard. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const fail = NextResponse.redirect(new URL("/login?verify=failed", request.url));

  if (!isDbConfigured || !token) return fail;

  try {
    const accountId = await consumeAuthToken("verify", token);
    if (!accountId) return fail;
    await dbSetEmailVerified(accountId);
    const account = await dbGetAccountAuth(accountId);
    if (account?.status === "banned") return fail;
    await createSession({ name: account?.name ?? accountId, email: accountId, school: account?.school ?? undefined });
    return NextResponse.redirect(new URL("/dashboard?verified=1", request.url));
  } catch (err) {
    console.error("email verify failed:", err);
    return fail;
  }
}
