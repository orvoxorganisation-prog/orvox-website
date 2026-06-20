import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DAY_MONTH_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

const TIME_FMT = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "14 Apr 2026" */
export function formatDate(input: string | Date) {
  return DATE_FMT.format(new Date(input));
}

/** "12-14 Apr 2026" — collapses shared month/year like a broadcast date strap. */
export function formatDateRange(start: string | Date, end: string | Date) {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}-${DATE_FMT.format(e)}`;
  }
  return `${DAY_MONTH_FMT.format(s)} - ${DATE_FMT.format(e)}`;
}

/** "10:00 AM" */
export function formatTime(input: string | Date) {
  return TIME_FMT.format(new Date(input));
}

/** Compact INR like ₹50L, ₹1.2Cr, ₹2,500. */
export function formatINR(amount: number) {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(amount % 1_00_00_000 === 0 ? 0 : 1)}Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(amount % 1_00_000 === 0 ? 0 : 1)}L`;
  return `₹${new Intl.NumberFormat("en-IN").format(amount)}`;
}

/** Whole-number with grouping, for stat counters. */
export function formatCount(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

/** Days remaining until a date (clamped at 0). */
export function daysUntil(input: string | Date) {
  const ms = new Date(input).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Initials for avatars: "Anaya Raghuvanshi" -> "AR". */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
