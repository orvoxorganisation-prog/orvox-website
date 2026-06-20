"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { AlertDialog } from "radix-ui";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Submit button that reflects the enclosing form's pending state. */
export function SubmitButton({ children, pendingLabel, ...props }: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel ?? "Working…" : children}
    </Button>
  );
}

/**
 * Destructive/confirmable action. Renders a hidden form bound to a server
 * action; the trigger opens an AlertDialog and confirming submits the form via
 * a JS ref (works across the portal boundary).
 */
export function ConfirmSubmit({
  action,
  hidden = {},
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = true,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <form ref={formRef} action={action} className="hidden">
        {Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      </form>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-[fade-up_0.15s_ease]" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface-2 p-6 ring-1 ring-inset ring-white/12 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)] motion-safe:animate-pop-in">
            <AlertDialog.Title className="text-base font-semibold text-ink-50">{title}</AlertDialog.Title>
            {description ? (
              <AlertDialog.Description className="mt-2 text-sm text-ink-400">{description}</AlertDialog.Description>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant={destructive ? "danger" : "yellow"}
                  size="sm"
                  onClick={() => formRef.current?.requestSubmit()}
                >
                  {confirmLabel}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}

/** Inline single-action form (no confirm) — for toggles, duplicate, etc. */
export function ActionForm({
  action,
  hidden = {},
  children,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form action={action} className={cn("inline-flex", className)}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
    </form>
  );
}
