import { randomBytes } from "node:crypto";

/** Short prefixed id, e.g. id("evt") -> "evt_a1b2c3d4e5". */
export function id(prefix: string): string {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** CSV-escape a single cell, neutralising spreadsheet formula injection. */
export function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // A leading =, +, -, @, tab or CR makes Excel/Sheets treat the cell as a
  // formula. Registrant-supplied fields (name, motivation…) flow into exports,
  // so prefix a single quote to force literal text.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return lines.join("\r\n");
}
