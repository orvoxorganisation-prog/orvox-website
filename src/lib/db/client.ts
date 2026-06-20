import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Neon serverless Postgres client.
 *
 * Set DATABASE_URL in .env.local to a Neon connection string and the tagged
 * template `sql` becomes available to the repo layer. While unset, the app
 * runs entirely on the typed seed data in src/lib/data, so it is fully
 * runnable out of the box and DB-ready the moment a URL is provided.
 */
export const isDbConfigured = Boolean(process.env.DATABASE_URL);

export const sql = isDbConfigured
  ? neon(process.env.DATABASE_URL!)
  : null;

/** Guarded accessor for code paths that require the database. */
export function requireSql() {
  if (!sql) {
    throw new Error(
      "DATABASE_URL is not set. Add a Neon connection string to .env.local to enable database persistence.",
    );
  }
  return sql;
}
