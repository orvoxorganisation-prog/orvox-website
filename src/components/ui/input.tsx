import * as React from "react";
import { cn } from "@/lib/utils";

/* Dark console fields: recessed plate, hover lighting, yellow signal focus
   with a soft outer glow — the Stripe-grade focus moment. */
const fieldBase =
  "w-full rounded-card bg-white/[0.04] px-4 text-[15px] text-canvas placeholder:text-ink-400 " +
  "shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] " +
  "ring-1 ring-inset ring-white/12 transition-[box-shadow,ring-color,background-color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] " +
  "hover:ring-white/20 " +
  "focus:outline-none focus:bg-white/[0.06] focus:ring-2 focus:ring-yellow focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),0_0_0_4px_rgba(255,208,47,0.14)] " +
  "aria-[invalid=true]:ring-danger aria-[invalid=true]:focus:ring-danger aria-[invalid=true]:focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),0_0_0_4px_rgba(255,81,71,0.14)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldBase, "h-12", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(fieldBase, "resize-none py-3 leading-relaxed", className)} {...props} />
));
Textarea.displayName = "Textarea";

// Dropdowns: use SelectField (components/ui/select-field.tsx). The native
// <select> popup is OS-drawn and can't be themed, so it's banned here.
