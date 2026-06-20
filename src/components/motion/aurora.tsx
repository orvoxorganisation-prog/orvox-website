import { cn } from "@/lib/utils";

/**
 * Aurora field — soft, drifting brand-color light sources placed behind content.
 * Each blob's color/size/position is supplied via Tailwind classes so a section
 * can own its palette. Motion is pure CSS (reduced-motion safe) and decorative.
 */
export function Aurora({
  blobs,
  className,
}: {
  blobs: string[];
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {blobs.map((blob, i) => (
        <span
          key={i}
          className={cn("aurora motion-safe-only", blob)}
          style={{ animation: "var(--animate-aurora)", animationDelay: `${i * -6}s` }}
        />
      ))}
    </div>
  );
}
