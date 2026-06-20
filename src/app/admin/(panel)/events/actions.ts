"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/admin/dal";
import { eventSchema } from "@/lib/admin/validation";
import { logAudit } from "@/lib/admin/audit";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  duplicateEvent,
  setEventPublished,
  setEventFeatured,
  bulkSetPublished,
  bulkDeleteEvents,
  type ScheduleInput,
} from "@/lib/admin/data/events";

export interface FormResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function readEvent(fd: FormData) {
  const bool = (k: string) => fd.get(k) === "on" || fd.get(k) === "true";
  return {
    title: fd.get("title"),
    slug: fd.get("slug") || undefined,
    subtitle: fd.get("subtitle") ?? "",
    season: fd.get("season") ?? "S03",
    track: fd.get("track"),
    accent: fd.get("accent") ?? "yellow",
    status: fd.get("status") ?? "open",
    format: fd.get("format") ?? "",
    mode: fd.get("mode") ?? "Online",
    venue: fd.get("venue") ?? "",
    city: fd.get("city") ?? "",
    startDate: fd.get("startDate"),
    endDate: fd.get("endDate"),
    registrationDeadline: fd.get("registrationDeadline"),
    eligibility: fd.get("eligibility") ?? "",
    seatsTotal: fd.get("seatsTotal") ?? 0,
    seatsFilled: fd.get("seatsFilled") ?? 0,
    prizePool: fd.get("prizePool") || undefined,
    heroStatValue: fd.get("heroStatValue") ?? "",
    heroStatLabel: fd.get("heroStatLabel") ?? "",
    summary: fd.get("summary") ?? "",
    about: fd.get("about") ?? "",
    rules: fd.get("rules") ?? "",
    eligibilityDetails: fd.get("eligibilityDetails") ?? "",
    contactName: fd.get("contactName") ?? "",
    contactRole: fd.get("contactRole") ?? "",
    contactEmail: fd.get("contactEmail") ?? "",
    tags: fd.get("tags") ?? "",
    published: bool("published"),
    featured: bool("featured"),
  };
}

function readSchedule(fd: FormData): ScheduleInput[] {
  const labels = fd.getAll("schedule_label").map(String);
  const dates = fd.getAll("schedule_date").map(String);
  const details = fd.getAll("schedule_detail").map(String);
  const out: ScheduleInput[] = [];
  for (let i = 0; i < labels.length; i++) {
    if (!labels[i] && !dates[i]) continue;
    out.push({ label: labels[i], date: dates[i], detail: details[i] ?? "" });
  }
  return out;
}

function revalidateEventSurfaces() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/events/[slug]", "page"); // all prerendered event detail pages
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export async function createEventAction(_prev: FormResult, fd: FormData): Promise<FormResult> {
  const admin = await requirePermission("events:write");
  const parsed = eventSchema.safeParse(readEvent(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const eventId = await createEvent(parsed.data, readSchedule(fd));
  await logAudit({ admin, action: "create", entityType: "event", entityId: eventId, summary: `Created event “${parsed.data.title}”` });
  revalidateEventSurfaces();
  redirect("/admin/events");
}

export async function updateEventAction(eventId: string, _prev: FormResult, fd: FormData): Promise<FormResult> {
  const admin = await requirePermission("events:write");
  const parsed = eventSchema.safeParse(readEvent(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  await updateEvent(eventId, parsed.data, readSchedule(fd));
  await logAudit({ admin, action: "update", entityType: "event", entityId: eventId, summary: `Updated event “${parsed.data.title}”` });
  revalidateEventSurfaces();
  redirect("/admin/events");
}

export async function deleteEventAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("events:delete");
  const eventId = String(fd.get("id"));
  await deleteEvent(eventId);
  await logAudit({ admin, action: "delete", entityType: "event", entityId: eventId, summary: `Deleted event ${eventId}` });
  revalidateEventSurfaces();
}

export async function duplicateEventAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("events:write");
  const eventId = String(fd.get("id"));
  const newId = await duplicateEvent(eventId);
  await logAudit({ admin, action: "duplicate", entityType: "event", entityId: newId, summary: `Duplicated event ${eventId}` });
  revalidateEventSurfaces();
}

export async function togglePublishAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("events:write");
  const eventId = String(fd.get("id"));
  const publish = fd.get("publish") === "true";
  await setEventPublished(eventId, publish);
  await logAudit({ admin, action: publish ? "publish" : "unpublish", entityType: "event", entityId: eventId, summary: `${publish ? "Published" : "Unpublished"} event ${eventId}` });
  revalidateEventSurfaces();
}

export async function toggleFeatureAction(fd: FormData): Promise<void> {
  const admin = await requirePermission("controls:write");
  const eventId = String(fd.get("id"));
  const feature = fd.get("feature") === "true";
  await setEventFeatured(eventId, feature);
  await logAudit({ admin, action: feature ? "feature" : "unfeature", entityType: "event", entityId: eventId, summary: `${feature ? "Featured" : "Unfeatured"} event ${eventId}` });
  revalidateEventSurfaces();
}

export async function bulkEventAction(fd: FormData): Promise<void> {
  const ids = fd.getAll("ids").map(String).filter(Boolean);
  const op = String(fd.get("op"));
  if (ids.length === 0) return;
  if (op === "delete") {
    const admin = await requirePermission("events:delete");
    const n = await bulkDeleteEvents(ids);
    await logAudit({ admin, action: "bulk_delete", entityType: "event", summary: `Bulk deleted ${n} events`, metadata: { ids } });
  } else if (op === "publish" || op === "unpublish") {
    const admin = await requirePermission("events:write");
    const n = await bulkSetPublished(ids, op === "publish");
    await logAudit({ admin, action: `bulk_${op}`, entityType: "event", summary: `Bulk ${op} ${n} events`, metadata: { ids } });
  }
  revalidateEventSurfaces();
}
