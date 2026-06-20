"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { adminLogin, type LoginState } from "./actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/admin/actions-ui";
import { FormField } from "@/components/admin/ui";

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(adminLogin, {});
  const from = useSearchParams().get("from") ?? "/admin";

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="from" value={from} />
      {state.error ? (
        <div className="flex items-center gap-2 rounded-xl bg-danger/12 px-4 py-3 text-sm text-danger ring-1 ring-inset ring-danger/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      ) : null}

      <FormField label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="username" placeholder="you@orvox.in" required />
      </FormField>

      <FormField label="Password" htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••••" required />
      </FormField>

      <SubmitButton variant="yellow" size="lg" className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
