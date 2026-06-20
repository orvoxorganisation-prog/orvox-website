"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A switch that submits a server action on toggle. The hidden `enabled` input
 * carries the *target* state (the opposite of current).
 */
export function Toggle({
  action,
  name,
  value,
  enabled,
  label,
  hint,
}: {
  action: (fd: FormData) => void | Promise<void>;
  name: string; // form field name for the key (e.g. "key")
  value: string; // the key value
  enabled: boolean;
  label: string;
  hint?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action} className="flex items-center justify-between gap-4 px-5 py-3.5">
      <input type="hidden" name={name} value={value} />
      <input type="hidden" name="enabled" value={String(!enabled)} />
      <div className="min-w-0">
        <p className="text-sm text-ink-100">{label}</p>
        {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      </div>
      <button
        type="submit"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${label}`}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          enabled ? "bg-teal" : "bg-white/12",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-canvas shadow transition-transform",
            enabled ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </form>
  );
}
