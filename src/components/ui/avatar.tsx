import { cn, initials } from "@/lib/utils";
import type { Accent } from "@/lib/data/types";

const accentRing: Record<Accent, string> = {
  yellow: "bg-yellow text-ink-900",
  teal: "bg-teal text-ink-900",
  rose: "bg-rose-deep text-ink-900",
  stage: "bg-canvas text-ink-900",
};

/** Initials avatar — flat brand fill, mono monogram. */
export function Avatar({
  name,
  accent = "stage",
  size = 40,
  className,
}: {
  name: string;
  accent?: Accent;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-mono font-medium",
        accentRing[accent],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
