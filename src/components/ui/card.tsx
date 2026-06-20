import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card families · console panel / pastel paper / stage.
 * Panel = the default dark plate. Pastel = 28r light "paper" moment.
 * The winner glow is reserved for victory states only.
 */
const cardVariants = cva("relative", {
  variants: {
    surface: {
      white: "rounded-card panel",
      panel: "rounded-card panel",
      raised: "rounded-card panel-raised",
      pastel: "rounded-feature",
      stage: "rounded-card bg-stage text-canvas ring-1 ring-white/8",
      plain: "rounded-card bg-white/[0.03] ring-1 ring-white/8",
    },
    pad: {
      none: "",
      sm: "p-5",
      md: "p-6",
      lg: "p-7 sm:p-8",
    },
    interactive: {
      true: "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
      false: "",
    },
    glow: {
      true: "shadow-[var(--shadow-glow-winner)]",
      false: "",
    },
  },
  defaultVariants: { surface: "white", pad: "md", interactive: false, glow: false },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface, pad, interactive, glow, ...props }, ref) => (
    <div
      ref={ref}
      data-paper={surface === "pastel" ? "" : undefined}
      className={cn(cardVariants({ surface, pad, interactive, glow }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";
