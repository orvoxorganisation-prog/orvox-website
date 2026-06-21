import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * RFC 6238 TOTP (SHA-1, 30s step, 6 digits) implemented with Node crypto only —
 * no native deps, compatible with Google Authenticator / Authy / 1Password. The
 * shared secret is stored base32-encoded on the admin row.
 */
const STEP_SECONDS = 30;
const DIGITS = 6;
const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): string {
  // 20 random bytes -> 32 base32 chars (160-bit secret).
  const bytes = randomBytes(20);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += B32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function base32Decode(secret: string): Buffer {
  const clean = secret.replace(/=+$/,"").toUpperCase().replace(/\s/g, "");
  let bits = "";
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (bin % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

/** Verifies a code allowing ±1 step of clock drift. Constant-time compare. */
export function verifyTotp(secret: string, code: string): boolean {
  const trimmed = (code ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(trimmed)) return false;
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  for (const drift of [-1, 0, 1]) {
    const expected = hotp(secret, counter + drift);
    const a = Buffer.from(expected);
    const b = Buffer.from(trimmed);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

/** otpauth:// URI for QR enrollment in authenticator apps. */
export function otpauthUri(secret: string, account: string, issuer = "ORVOX"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: String(DIGITS), period: String(STEP_SECONDS) });
  return `otpauth://totp/${label}?${params.toString()}`;
}
