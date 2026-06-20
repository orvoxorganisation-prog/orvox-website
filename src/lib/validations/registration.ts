import { z } from "zod";

export const categoryOptions = [
  "Debate",
  "Public speaking",
  "Pitch",
  "Founder track",
] as const;

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Tell us your name")
    .max(80, "That's a little long"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  school: z
    .string()
    .trim()
    .min(2, "Add your school or college")
    .max(120, "That's a little long"),
  category: z.enum(categoryOptions, {
    message: "Pick a track",
  }),
  partner: z.string().trim().max(80).optional().or(z.literal("")),
  motivation: z
    .string()
    .trim()
    .max(400, "Keep it under 400 characters")
    .optional()
    .or(z.literal("")),
  agree: z.literal(true, {
    message: "You'll need to agree to the rules",
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationResult =
  | { ok: true; confirmationId: string }
  | { ok: false; message: string };
