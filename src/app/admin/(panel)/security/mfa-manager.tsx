"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/admin/ui";
import { beginMfaSetup, confirmMfaAction, disableMfaAction } from "./actions";

export function MfaManager({ enabled, email }: { enabled: boolean; email: string }) {
  const [setup, setSetup] = React.useState<{ secret: string; uri: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const start = async () => {
    setBusy(true);
    try {
      setSetup(await beginMfaSetup());
    } catch {
      toast.error("Couldn't start 2FA setup. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const res = await confirmMfaAction({ ok: false }, new FormData(e.currentTarget));
    setBusy(false);
    if (res.ok) {
      toast.success("Two-factor authentication enabled");
      setSetup(null);
    } else {
      toast.error(res.error ?? "Couldn't verify the code.");
    }
  };

  const disable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const res = await disableMfaAction({ ok: false }, new FormData(e.currentTarget));
    setBusy(false);
    if (res.ok) toast.success("Two-factor authentication disabled");
    else toast.error(res.error ?? "Couldn't disable 2FA.");
  };

  if (enabled) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-teal">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-sm font-semibold">Two-factor authentication is on</p>
        </div>
        <p className="text-sm text-ink-400">
          You will be asked for a 6-digit code from your authenticator app each time you sign in.
        </p>
        <form onSubmit={disable} className="space-y-3 rounded-xl bg-danger/[0.04] p-4 ring-1 ring-inset ring-danger/20">
          <FormField label="Confirm your password to turn off 2FA" htmlFor="password" required>
            <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••••" required />
          </FormField>
          <Button type="submit" variant="danger" size="sm" disabled={busy}>
            {busy ? "Working…" : "Disable 2FA"}
          </Button>
        </form>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-ink-300">
          <ShieldAlert className="h-5 w-5 text-yellow" />
          <p className="text-sm font-semibold">Two-factor authentication is off</p>
        </div>
        <p className="text-sm text-ink-400">
          Add a second factor with any authenticator app (Google Authenticator, Authy, 1Password). Strongly recommended for admin accounts.
        </p>
        <Button type="button" variant="yellow" size="md" onClick={start} disabled={busy}>
          {busy ? "Preparing…" : "Set up two-factor"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-300">
        1. In your authenticator app, add an account for <span className="font-medium text-ink-100">{email}</span> using this key:
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 break-all rounded-lg bg-void px-3 py-2 font-mono text-sm text-yellow ring-1 ring-inset ring-white/10">
          {setup.secret}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText(setup.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-ink-500">
        Or use the setup URI: <span className="break-all font-mono">{setup.uri}</span>
      </p>
      <form onSubmit={confirm} className="space-y-3 border-t border-white/8 pt-4">
        <FormField label="2. Enter the 6-digit code to confirm" htmlFor="code" required>
          <Input id="code" name="code" inputMode="numeric" maxLength={6} pattern="[0-9]*" placeholder="123456" autoComplete="one-time-code" required />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" variant="yellow" size="sm" disabled={busy}>
            {busy ? "Verifying…" : "Enable 2FA"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSetup(null)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
