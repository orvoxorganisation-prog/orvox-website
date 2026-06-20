"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Premium dropdown built on Radix Select. The native <select> popup is OS-drawn
 * and unstylable (the white menu in the bug report); this renders the open menu
 * as a dark console panel that matches the rest of the system. Fully keyboard
 * operable, portal-rendered, and animated from the trigger edge.
 */
export function SelectField({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  invalid,
  disabled,
  className,
}: {
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        className={cn(
          "group flex h-12 w-full items-center justify-between gap-3 rounded-card bg-white/[0.04] px-4 text-left text-[15px] text-canvas",
          "shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/12",
          "transition-[box-shadow,ring-color,background-color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
          "hover:ring-white/20",
          "focus:outline-none focus:bg-white/[0.06] focus:ring-2 focus:ring-yellow focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),0_0_0_4px_rgba(255,208,47,0.14)]",
          "data-[placeholder]:text-ink-400",
          "aria-[invalid=true]:ring-danger",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
            strokeWidth={1.75}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-card panel-raised p-1.5",
            "motion-safe:animate-pop-in",
          )}
        >
          <SelectPrimitive.Viewport className="max-h-72">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option}
                value={option}
                className={cn(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-[8px] py-2.5 pl-3 pr-9 text-sm text-ink-200 outline-none",
                  "transition-colors duration-100",
                  "data-[highlighted]:bg-white/8 data-[highlighted]:text-canvas",
                  "data-[state=checked]:text-canvas",
                )}
              >
                <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex items-center">
                  <Check className="h-4 w-4 text-yellow" strokeWidth={2.5} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
