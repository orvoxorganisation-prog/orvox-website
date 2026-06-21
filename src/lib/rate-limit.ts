import "server-only";
import { headers } from "next/headers";
import { sql } from "@/lib/db/client";

/**
 * Fixed-window rate limiting backed by the `rate_limits` table. A single atomic
 * upsert increments the counter (or resets it when the window has rolled over),
 * so it is correct across the many short-lived instances a serverless deploy
 * spins up — unlike an in-memory counter. Fails OPEN: if the DB is unavailable
 * we allow the request rather than break the site.
 */
export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export async function rateLimit(
  bucket: string,
  max: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (!sql) return { ok: true, remaining: max, retryAfterSec: 0 };
  try {
    const rows = (await sql`
      insert into rate_limits (bucket, count, window_start)
      values (${bucket}, 1, now())
      on conflict (bucket) do update set
        count = case
          when rate_limits.window_start < now() - make_interval(secs => ${windowSec})
          then 1 else rate_limits.count + 1 end,
        window_start = case
          when rate_limits.window_start < now() - make_interval(secs => ${windowSec})
          then now() else rate_limits.window_start end
      returning count, extract(epoch from (window_start + make_interval(secs => ${windowSec}) - now()))::int as reset_in
    `) as Array<{ count: number; reset_in: number }>;
    const count = rows[0]?.count ?? 1;
    const retryAfterSec = Math.max(0, rows[0]?.reset_in ?? windowSec);
    return { ok: count <= max, remaining: Math.max(0, max - count), retryAfterSec };
  } catch (err) {
    console.error("rateLimit check failed (allowing request):", err);
    return { ok: true, remaining: max, retryAfterSec: 0 };
  }
}

/** Drops rate-limit buckets whose window ended over an hour ago. */
export async function pruneRateLimits(): Promise<number> {
  if (!sql) return 0;
  const rows = (await sql`
    with deleted as (
      delete from rate_limits where window_start < now() - interval '1 hour' returning 1
    ) select count(*)::int as n from deleted
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

/** Best-effort client IP from proxy headers; "unknown" when not present. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
