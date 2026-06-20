import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Eyebrow — the broadcast lower-third. Mono, tracked, dot-separated.
 * Pass `items` for "S03 · DEBATE FINALS · MUMBAI", or children for free-form.
 * A deliberate brand element; use with restraint, not above every section.
 */
export function Eyebrow({
  items,
  children,
  live,
  className,
  as: Tag = "p",
}: {
  items?: string[];
  children?: React.ReactNode;
  live?: boolean;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("eyebrow inline-flex items-center gap-2", className)}>
      {live && (
        <span
          className="motion-safe-only inline-block h-1.5 w-1.5 rounded-full bg-live"
          style={{ animation: "var(--animate-live-pulse)" }}
          aria-hidden
        />
      )}
      {items ? (
        items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span aria-hidden className="text-ink-300">·</span>}
            <span>{item}</span>
          </React.Fragment>
        ))
      ) : (
        children
      )}
    </Tag>
  );
}
