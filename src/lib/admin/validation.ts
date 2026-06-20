import { z } from "zod";

/** Zod schemas for admin inputs. Server actions validate against these before
 *  touching the database — defence in depth on top of UI validation. */

export const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const trackEnum = z.enum(["debate", "pitch", "speaking", "oped"]);
const accentEnum = z.enum(["yellow", "teal", "rose", "stage"]);
const eventStatusEnum = z.enum(["open", "closing-soon", "live", "upcoming", "closed"]);
const eventModeEnum = z.enum(["Online", "On-site", "Hybrid"]);

const lines = z
  .string()
  .optional()
  .transform((v) => (v ? v.split("\n").map((s) => s.trim()).filter(Boolean) : []));

export const eventSchema = z.object({
  title: z.string().min(2, "Title is required").max(160),
  slug: z.string().max(80).optional(),
  subtitle: z.string().max(200).optional().default(""),
  season: z.string().max(20).optional().default("S03"),
  track: trackEnum,
  accent: accentEnum.default("yellow"),
  status: eventStatusEnum.default("open"),
  format: z.string().max(120).optional().default(""),
  mode: eventModeEnum.default("Online"),
  venue: z.string().max(160).optional().default(""),
  city: z.string().max(120).optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  registrationDeadline: z.string().min(1, "Deadline is required"),
  eligibility: z.string().max(200).optional().default(""),
  seatsTotal: z.coerce.number().int().min(0).default(0),
  seatsFilled: z.coerce.number().int().min(0).default(0),
  prizePool: z.coerce.number().int().min(0).optional(),
  heroStatValue: z.string().max(40).optional().default(""),
  heroStatLabel: z.string().max(60).optional().default(""),
  summary: z.string().max(400).optional().default(""),
  about: lines,
  rules: lines,
  eligibilityDetails: lines,
  contactName: z.string().max(120).optional().default(""),
  contactRole: z.string().max(120).optional().default(""),
  contactEmail: z.string().max(160).optional().default(""),
  tags: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [])),
  published: z.coerce.boolean().default(true),
  featured: z.coerce.boolean().default(false),
});
export type EventInput = z.infer<typeof eventSchema>;

export const adminUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: z.enum(["superadmin", "admin", "editor", "viewer"]),
  password: z.string().min(10, "Use at least 10 characters").optional(),
});

export const faqSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(3).max(2000),
  category: z.string().max(80).default("General"),
  position: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export const navItemSchema = z.object({
  location: z.enum(["header", "footer"]),
  groupLabel: z.string().max(80).optional().default(""),
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(200),
  position: z.coerce.number().int().default(0),
  enabled: z.coerce.boolean().default(true),
});

export const mediaUrlSchema = z.object({
  url: z.string().url("Enter a valid URL"),
  filename: z.string().min(1).max(200),
  alt: z.string().max(300).optional().default(""),
  folder: z.string().max(80).optional().default("general"),
});

export const announcementSchema = z.object({
  type: z.enum(["schedule", "result", "reminder", "feedback"]).default("reminder"),
  title: z.string().min(2).max(200),
  body: z.string().max(2000).optional().default(""),
  href: z.string().max(200).optional().default(""),
  published: z.coerce.boolean().default(true),
});
