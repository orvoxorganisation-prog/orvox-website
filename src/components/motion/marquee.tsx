import { cn } from "@/lib/utils";

/**
 * Infinite marquee — pure CSS (off main thread), reduced-motion safe via the
 * motion-safe-only utility. Content is duplicated so the loop is seamless.
 */
export function Marquee({
  children,
  className,
  itemClassName,
  reverse = false,
  durationSec = 38,
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  reverse?: boolean;
  durationSec?: number;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)} aria-hidden>
      <div
        className={cn("motion-safe-only flex min-w-full shrink-0 items-center", itemClassName)}
        style={{
          animation: "var(--animate-marquee)",
          animationDuration: `${durationSec}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
      <div
        className={cn("motion-safe-only flex min-w-full shrink-0 items-center", itemClassName)}
        style={{
          animation: "var(--animate-marquee)",
          animationDuration: `${durationSec}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
    </div>
  );
}
