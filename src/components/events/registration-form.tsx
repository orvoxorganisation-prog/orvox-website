"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, Check, Calendar, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import {
  registrationSchema,
  categoryOptions,
  type RegistrationInput,
} from "@/lib/validations/registration";
import { registerForEvent } from "@/app/(marketing)/events/[slug]/register/actions";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

export function RegistrationForm({
  slug,
  eventTitle,
  defaultCategory,
}: {
  slug: string;
  eventTitle: string;
  defaultCategory?: (typeof categoryOptions)[number];
}) {
  const [confirmation, setConfirmation] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      school: "",
      category: defaultCategory,
      partner: "",
      motivation: "",
      agree: false as unknown as true,
    },
  });

  const motivation = watch("motivation") ?? "";

  const onSubmit = handleSubmit(async (data) => {
    const result = await registerForEvent(slug, data);
    if (result.ok) {
      setConfirmation(result.confirmationId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error(result.message);
    }
  });

  return (
    <AnimatePresence mode="wait">
      {confirmation ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-feature panel-raised p-8 sm:p-10"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success text-ink-900">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-canvas">
            You're <em className="text-teal">in.</em>
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-300">
            Your seat for <span className="font-medium text-canvas">{eventTitle}</span> is
            confirmed. We've sent the details and your round schedule to your inbox.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-card bg-white/[0.04] px-4 py-3 ring-1 ring-inset ring-white/12">
            <Eyebrow>Confirmation</Eyebrow>
            <span className="font-mono text-lg font-semibold tracking-tight text-yellow">{confirmation}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary", size: "md" }), "group")}>
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
              Go to dashboard
            </Link>
            <Link href={`/events/${slug}`} className={buttonVariants({ variant: "ghost", size: "md" })}>
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
              Back to event
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          noValidate
          initial={false}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
              <Input
                id="fullName"
                placeholder="Your full name"
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
            </Field>
            <Field label="School / college" htmlFor="school" error={errors.school?.message}>
              <Input
                id="school"
                placeholder="Your school or college"
                aria-invalid={!!errors.school}
                {...register("school")}
              />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone?.message} optional>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </Field>
          </div>

          <Field label="Track" htmlFor="category" error={errors.category?.message}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" id="category" role="radiogroup" aria-label="Track">
                  {categoryOptions.map((option) => {
                    const active = field.value === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => field.onChange(option)}
                        className={cn(
                          "press rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-150",
                          active
                            ? "bg-canvas text-ink-900"
                            : "bg-white/[0.04] text-ink-300 ring-1 ring-inset ring-white/15 hover:bg-white/8 hover:text-canvas",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </Field>

          <Field label="Partner" htmlFor="partner" hint="For team events. Leave blank to be paired in the lobby." optional>
            <Input id="partner" placeholder="Your debate partner" {...register("partner")} />
          </Field>

          <Field
            label="Why ORVOX?"
            htmlFor="motivation"
            hint={`${motivation.length}/400. One line is plenty.`}
            optional
          >
            <Textarea
              id="motivation"
              rows={3}
              placeholder="I want to argue better. Win louder. Build something with the people I meet here."
              {...register("motivation")}
            />
          </Field>

          <Controller
            control={control}
            name="agree"
            render={({ field }) => (
              <div>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={!!field.value}
                  onClick={() => field.onChange(!field.value)}
                  className="group flex items-start gap-3 text-left"
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      field.value
                        ? "border-yellow bg-yellow text-ink-900"
                        : "border-white/25 bg-transparent group-hover:border-white/45",
                    )}
                  >
                    {field.value && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-ink-300">
                    I've read the rules and the code of conduct, and I'm ready to compete.
                  </span>
                </button>
                {errors.agree && (
                  <p role="alert" className="mt-2 text-[13px] text-danger">
                    {errors.agree.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" variant="yellow" size="lg" disabled={isSubmitting} className="group min-w-44">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  Locking your seat
                </>
              ) : (
                <>
                  Lock my seat
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </>
              )}
            </Button>
            <p className="text-[12px] text-ink-400">Free to enter. Confirmation by email.</p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
