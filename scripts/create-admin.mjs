// Creates or updates a super-admin account.
// Usage:
//   node scripts/create-admin.mjs <email> <name> [password] [role]
// If no password is given, a strong one is generated and printed once.
import { Client, neonConfig } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { randomBytes, scrypt as _scrypt } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt);

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
neonConfig.webSocketConstructor = globalThis.WebSocket;

const [, , emailArg, nameArg, passArg, roleArg] = process.argv;
if (!emailArg || !nameArg) {
  console.error("Usage: node scripts/create-admin.mjs <email> <name> [password] [role]");
  process.exit(1);
}
const email = emailArg.toLowerCase();
const name = nameArg;
const role = roleArg || "superadmin";
const password = passArg || `OX-${randomBytes(9).toString("base64url")}`;

async function hashPassword(pw) {
  const salt = randomBytes(16);
  const derived = await scrypt(pw.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const client = new Client(process.env.DATABASE_URL);
await client.connect();
try {
  const hash = await hashPassword(password);
  const id = "adm_" + randomBytes(6).toString("hex");
  await client.query(
    `insert into admin_users (id, email, name, password_hash, role, status)
     values ($1,$2,$3,$4,$5,'active')
     on conflict (email) do update set
       name = excluded.name, password_hash = excluded.password_hash,
       role = excluded.role, status = 'active', updated_at = now()`,
    [id, email, name, hash, role],
  );
  console.log("Admin ready:");
  console.log("  email:   ", email);
  console.log("  role:    ", role);
  if (!passArg) console.log("  password:", password, "  <-- save this now, it won't be shown again");
} finally {
  await client.end();
}
