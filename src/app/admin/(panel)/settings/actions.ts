"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { logAudit } from "@/lib/admin/audit";
import { getAllSettings, updateSetting } from "@/lib/admin/data/cms";

export interface SettingsResult {
  ok: boolean;
  error?: string;
}

const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

/** Sets a possibly-nested key (dotted path) on an object, cloning as it goes. */
function setPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  // Reject prototype-pollution payloads (e.g. field:__proto__.polluted).
  if (parts.some((p) => FORBIDDEN_KEYS.has(p))) return;
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export async function updateSettingsAction(_prev: SettingsResult, fd: FormData): Promise<SettingsResult> {
  const admin = await requirePermission("settings:write");
  const key = String(fd.get("group"));
  const all = await getAllSettings();
  const value: Record<string, unknown> = structuredClone(all[key] ?? {});

  for (const [name, raw] of fd.entries()) {
    if (name.startsWith("field:")) setPath(value, name.slice(6), String(raw));
  }

  await updateSetting(key, value, admin.email);
  await logAudit({ admin, action: "update", entityType: "setting", entityId: key, summary: `Updated ${key} settings` });
  revalidatePath("/", "layout");
  return { ok: true };
}
