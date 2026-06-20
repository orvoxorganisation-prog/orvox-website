import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pill is the signature — every button is fully rounded.
 * Press feedback (scale 0.97) gives the interface instant responsiveness.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
    "transition-[transform,background-color,color,box-shadow,border-color,filter] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] " +
    "motion-safe:hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      /* Dark-first vocabulary: primary = white pill on void, yellow = signal moment. */
      variant: {
        primary:
          "bg-canvas text-ink-900 shadow-[inset_0_-1px_0_rgba(14,15,18,0.15),0_12px_32px_-16px_rgba(255,255,255,0.35)] hover:bg-ink-100",
        yellow:
          "bg-gradient-to-b from-yellow to-yellow-deep text-ink-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_32px_-12px_rgba(255,208,47,0.45)] hover:brightness-105",
        teal: "bg-teal text-ink-900 hover:bg-teal/85",
        ghost:
          "bg-transparent text-ink-200 ring-1 ring-inset ring-white/15 hover:bg-white/5 hover:text-canvas hover:ring-white/25",
        light: "bg-canvas text-ink-900 hover:bg-ink-100",
        ghostDark:
          "bg-transparent text-ink-200 ring-1 ring-inset ring-white/15 hover:bg-white/5 hover:text-canvas hover:ring-white/25",
        danger: "bg-danger/15 text-danger ring-1 ring-inset ring-danger/30 hover:bg-danger/25",
        link: "text-canvas underline-offset-4 hover:underline px-0 active:scale-100",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-7 text-[15px]",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
