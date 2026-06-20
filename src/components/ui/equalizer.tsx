import { cn } from "@/lib/utils";

/**
 * The ORVOX signature — a five-bar audio equalizer that stands in for the "O".
 * `live` animates the bars (CSS keyframes, off the main thread, reduced-motion
 * safe). Static by default so it reads as a mark, not a distraction.
 */
const BARS = [
  { h: "45%", delay: "0ms" },
  { h: "85%", delay: "120ms" },
  { h: "65%", delay: "240ms" },
  { h: "100%", delay: "60ms" },
  { h: "55%", delay: "200ms" },
];

export function Equalizer({
  live = false,
  className,
  barClassName,
}: {
  live?: boolean;
  className?: string;
  barClassName?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-[0.78em] items-end gap-[0.1em]", className)}
    >
      {BARS.map((bar, i) => (
        <span
          key={i}
          className={cn(
            "w-[0.13em] rounded-full bg-current",
            live && "motion-safe-only origin-bottom",
            barClassName,
          )}
          style={{
            height: live ? "100%" : bar.h,
            animation: live ? "var(--animate-eq)" : undefined,
            animationDelay: live ? bar.delay : undefined,
          }}
        />
      ))}
    </span>
  );
}
