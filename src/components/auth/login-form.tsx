"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login } from "@/app/(auth)/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await login(data);
    if (!result.ok) {
      toast.error(result.message ?? "Couldn't log you in. Try again.");
      return;
    }
    toast.success("Welcome back");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" placeholder="you@school.edu" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting} className="group w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Logging in
          </>
        ) : (
          <>
            Log in
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-ink-400">
        New to ORVOX?{" "}
        <Link href="/signup" className="font-medium text-canvas underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
