import { NextResponse } from "next/server";
import { pruneExpiredSessions } from "@/lib/admin/session";
import { pruneAuditLogs } from "@/lib/admin/audit";
import { pruneAuthTokens } from "@/lib/auth/tokens";
import { pruneRateLimits } from "@/lib/rate-limit";
import { isDbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * Scheduled maintenance: enforces the log-retention policy and clears expired
 * sessions / one-time tokens / rate-limit buckets. Protected by CRON_SECRET
 * (Vercel Cron sends it as `Authorization: Bearer <secret>`). Configure the
 * schedule in vercel.json.
 */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run unprotected
  const auth = request.headers.get("authorization");
  const qp = new URL(request.url).searchParams.get("key");
  return auth === `Bearer ${secret}` || qp === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  if (!isDbConfigured) return NextResponse.json({ ok: false, error: "No database configured." }, { status: 400 });

  const retentionDays = Number(process.env.AUDIT_RETENTION_DAYS ?? 365);
  try {
    const [auditDeleted, tokensDeleted, rateLimitsDeleted] = await Promise.all([
      pruneAuditLogs(retentionDays),
      pruneAuthTokens(),
      pruneRateLimits(),
    ]);
    await pruneExpiredSessions();
    return NextResponse.json({
      ok: true,
      retentionDays,
      auditDeleted,
      tokensDeleted,
      rateLimitsDeleted,
    });
  } catch (err) {
    console.error("cron cleanup failed:", err);
    return NextResponse.json({ ok: false, error: "Cleanup failed." }, { status: 500 });
  }
}
