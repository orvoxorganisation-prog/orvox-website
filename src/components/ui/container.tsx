import * as React from "react";
import { cn } from "@/lib/utils";

/** Page gutter — one max-width, consistent horizontal padding. */
export function Container({
  className,
  as: Tag = "div",
  children,
}: {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[78rem] px-5 sm:px-8", className)}>
      {children}
    </Tag>
  );
}

/** Vertical section rhythm. */
export function Section({
  className,
  children,
  id,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)} {...rest}>
      {children}
    </section>
  );
}
