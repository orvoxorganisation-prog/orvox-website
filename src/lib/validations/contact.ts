import { z } from "zod";

export const contactTopics = [
  "General",
  "Hosting an event",
  "Judging / adjudication",
  "Press",
  "Partnership",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  topic: z.enum(contactTopics, { message: "Pick a topic" }),
  message: z
    .string()
    .trim()
    .min(10, "A little more detail helps")
    .max(1000, "Keep it under 1000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResult = { ok: true } | { ok: false; message: string };
