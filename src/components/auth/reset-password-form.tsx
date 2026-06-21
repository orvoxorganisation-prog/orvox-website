"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPassword } from "@/app/(auth)/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await resetPassword(data);
    if (!result.ok) {
      toast.error(result.message ?? "Couldn't reset your password.");
      return;
    }
    toast.success(result.message ?? "Password updated");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <input type="hidden" {...register("token")} />
      <Field label="New password" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting} className="group w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Updating
          </>
        ) : (
          <>
            Set new password
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </>
        )}
      </Button>
    </form>
  );
}
