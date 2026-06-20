import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Chips & status badges — pills, dot-separated, broadcast energy. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap leading-none",
  {
    variants: {
      /* Dark-first chips: tinted washes with signal text, AA on void/stage. */
      variant: {
        solid: "bg-canvas text-ink-900",
        yellow: "bg-yellow/12 text-yellow ring-1 ring-inset ring-yellow/25",
        teal: "bg-teal/12 text-teal ring-1 ring-inset ring-teal/25",
        rose: "bg-rose-deep/12 text-rose-deep ring-1 ring-inset ring-rose-deep/25",
        ghost: "ring-1 ring-inset ring-white/15 text-ink-300",
        ghostDark: "ring-1 ring-inset ring-white/15 text-ink-300",
        success: "bg-success/12 text-success ring-1 ring-inset ring-success/25",
        danger: "bg-danger/12 text-danger ring-1 ring-inset ring-danger/30",
        warning: "bg-warning/12 text-warning ring-1 ring-inset ring-warning/25",
        muted: "bg-white/6 text-ink-300",
      },
      size: {
        sm: "h-6 px-2.5 text-[11px]",
        md: "h-7 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "muted", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

/** On-air badge — black pill, pulsing live dot. */
export function LiveBadge({ className, children = "Live now" }: { className?: string; children?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full bg-ink-900 px-3 text-xs font-medium text-canvas ring-1 ring-inset ring-white/15",
        className,
      )}
    >
      <span className="motion-safe-only inline-block h-1.5 w-1.5 rounded-full bg-live" style={{ animation: "var(--animate-live-pulse)" }} />
      <span className="uppercase tracking-wide">{children}</span>
    </span>
  );
}
