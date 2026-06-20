"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Accessible toggle switch with a snappy thumb. */
export function Switch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  id,
  label,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  id?: string;
  label?: string;
}) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const checked = controlled ?? internal;

  const toggle = () => {
    const next = !checked;
    if (controlled === undefined) setInternal(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
        checked ? "bg-teal" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-canvas shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
          checked ? "translate-x-[1.125rem]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
