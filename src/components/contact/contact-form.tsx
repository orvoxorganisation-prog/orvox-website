"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { contactSchema, contactTopics, type ContactInput } from "@/lib/validations/contact";
import { sendContactMessage } from "@/app/(marketing)/contact/actions";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: "General", message: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await sendContactMessage(data);
    if (result.ok) {
      setSent(true);
      reset();
    } else {
      toast.error(result.message);
    }
  });

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-feature panel-raised p-8"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-success text-ink-900">
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-canvas">Message sent.</h2>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-300">
            Thanks. We read everything that comes in and reply within a day or two.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="press mt-6 text-sm font-medium text-canvas underline underline-offset-4"
          >
            Send another
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="Your name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="you@email.com" aria-invalid={!!errors.email} {...register("email")} />
            </Field>
          </div>

          <Field label="Topic" htmlFor="topic" error={errors.topic?.message}>
            <Controller
              control={control}
              name="topic"
              render={({ field }) => (
                <SelectField
                  id="topic"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={contactTopics}
                  invalid={!!errors.topic}
                />
              )}
            />
          </Field>

          <Field label="Message" htmlFor="message" error={errors.message?.message}>
            <Textarea
              id="message"
              rows={5}
              placeholder="What's on your mind?"
              aria-invalid={!!errors.message}
              {...register("message")}
            />
          </Field>

          <Button type="submit" size="lg" disabled={isSubmitting} className="group min-w-44">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                Sending
              </>
            ) : (
              <>
                Send message
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </>
            )}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
