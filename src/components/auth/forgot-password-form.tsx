"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestResetSchema, type RequestResetInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await requestPasswordReset(data);
    if (!result.ok) {
      toast.error(result.message ?? "Something went wrong. Try again.");
      return;
    }
    toast.success(result.message ?? "Check your email for a reset link.");
    reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" placeholder="you@school.edu" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting} className="group w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Sending
          </>
        ) : (
          <>
            Send reset link
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-ink-400">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-canvas underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
