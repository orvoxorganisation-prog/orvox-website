// Applies src/lib/db/schema.sql to the Neon database (idempotent).
import { Client, neonConfig } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Load DATABASE_URL from .env.local
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
neonConfig.webSocketConstructor = globalThis.WebSocket;

const schema = readFileSync(new URL("../src/lib/db/schema.sql", import.meta.url), "utf8");
const client = new Client(process.env.DATABASE_URL);
await client.connect();
try {
  await client.query(schema);
  console.log("Schema applied OK.");
  const t = await client.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name",
  );
  console.log("TABLES (" + t.rows.length + "):", t.rows.map((r) => r.table_name).join(", "));
} finally {
  await client.end();
}
