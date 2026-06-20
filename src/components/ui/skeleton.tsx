import { cn } from "@/lib/utils";

/**
 * Skeleton placeholder — matches the shape of the content it stands in for.
 * Pulse collapses under reduced motion (motion-safe gate); the block itself
 * always renders so layout never shifts when data arrives.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("rounded-card bg-white/[0.06] motion-safe:animate-pulse", className)}
    />
  );
}
