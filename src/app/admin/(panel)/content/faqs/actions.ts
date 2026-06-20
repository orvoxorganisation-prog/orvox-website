"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/dal";
import { faqSchema } from "@/lib/admin/validation";
import { logAudit } from "@/lib/admin/audit";
import { createFaq, updateFaq, deleteFaq } from "@/lib/admin/data/cms";

export interface FaqResult {
  ok: boolean;
  error?: string;
}

function read(fd: FormData) {
  return faqSchema.safeParse({
    question: fd.get("question"),
    answer: fd.get("answer"),
    category: fd.get("category") || "General",
    position: fd.get("position") || 0,
    published: fd.get("published") === "on" || fd.get("published") === "true",
  });
}

export async function createFaqAction(_prev: FaqResult, fd: FormData): Promise<FaqResult> {
  const admin = await requirePermission("content:write");
  const parsed = read(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createFaq(parsed.data);
  await logAudit({ admin, action: "create", entityType: "faq", summary: `Added FAQ “${parsed.data.question}”` });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateFaqAction(_prev: FaqResult, fd: FormData): Promise<FaqResult> {
  const admin = await requirePermission("content:write");
  const id = Number(fd.get("id"));
  const parsed = read(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateFaq(id, parsed.data);
  await logAudit({ admin, action: "update", entityType: "faq", entityId: String(id), summary: `Updated FAQ #${id}` });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteFaqAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("content:write");
  const id = Number(fd.get("id"));
  await deleteFaq(id);
  await logAudit({ admin, action: "delete", entityType: "faq", entityId: String(id), summary: `Deleted FAQ #${id}` });
  revalidatePath("/", "layout");
}
