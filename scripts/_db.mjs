// Shared DB helper for migration/seed scripts. Loads DATABASE_URL from
// .env.local and exposes a Neon serverless `sql` tag.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set (.env.local missing?)");
  process.exit(1);
}
export const sql = neon(process.env.DATABASE_URL);
