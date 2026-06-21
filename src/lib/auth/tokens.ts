import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { requireSql } from "@/lib/db/client";

/**
 * One-time tokens for email verification and password reset. The raw token is
 * returned to the caller (to embed in a link) but only its SHA-256 hash is
 * persisted, so a leaked `auth_tokens` row can't be replayed. Tokens are
 * single-use (consume marks `used_at`) and time-limited.
 */
export type TokenPurpose = "verify" | "reset";

const TTL_MS: Record<TokenPurpose, number> = {
  verify: 1000 * 60 * 60 * 24, // 24 hours
  reset: 1000 * 60 * 30, // 30 minutes
};

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Issues a token for an account; invalidates prior unused tokens of same purpose. */
export async function createAuthToken(purpose: TokenPurpose, accountId: string): Promise<string> {
  const sql = requireSql();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS[purpose]).toISOString();
  // One live token per (account, purpose): drop earlier unused ones.
  await sql`delete from auth_tokens where account_id = ${accountId} and purpose = ${purpose} and used_at is null`;
  await sql`
    insert into auth_tokens (purpose, account_id, token_hash, expires_at)
    values (${purpose}, ${accountId}, ${hash(token)}, ${expiresAt})
  `;
  return token;
}

/** Removes expired or already-used tokens. Returns count deleted. */
export async function pruneAuthTokens(): Promise<number> {
  const rows = (await requireSql()`
    with deleted as (
      delete from auth_tokens where expires_at < now() or used_at is not null returning 1
    ) select count(*)::int as n from deleted
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

/** Validates + consumes a token. Returns the account id, or null if invalid. */
export async function consumeAuthToken(purpose: TokenPurpose, token: string): Promise<string | null> {
  if (!token) return null;
  const sql = requireSql();
  const rows = (await sql`
    update auth_tokens set used_at = now()
    where token_hash = ${hash(token)}
      and purpose = ${purpose}
      and used_at is null
      and expires_at > now()
    returning account_id
  `) as Array<{ account_id: string }>;
  return rows[0]?.account_id ?? null;
}
