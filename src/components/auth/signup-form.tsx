"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { signup } from "@/app/(auth)/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", school: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await signup(data);
    if (!result.ok) {
      toast.error(result.message ?? "Couldn't create your account. Try again.");
      return;
    }
    toast.success("You're in. Welcome to ORVOX.");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Full name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="Your full name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" placeholder="you@school.edu" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message} hint="At least 6 characters.">
        <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
      </Field>

      <Field label="School / college" htmlFor="school" error={errors.school?.message} optional>
        <Input id="school" placeholder="Your school or college" {...register("school")} />
      </Field>

      <Button type="submit" variant="yellow" size="lg" disabled={isSubmitting} className="group w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Creating your account
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-ink-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-canvas underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
