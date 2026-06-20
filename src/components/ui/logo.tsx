import Link from "next/link";
import { cn } from "@/lib/utils";
import { Equalizer } from "./equalizer";

/**
 * ORVOX wordmark: equalizer-O + cinematic italic "rvox" (Instrument Serif),
 * echoing the brand's chunky italic. Dark-first: the default reads on void;
 * `paper` flips to ink for light moments.
 */
export function Logo({
  variant = "stage",
  live = false,
  className,
  href = "/",
  asLink = true,
}: {
  variant?: "light" | "stage" | "paper";
  live?: boolean;
  className?: string;
  href?: string;
  asLink?: boolean;
}) {
  const isPaper = variant === "paper";

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-[0.18em] leading-none",
        isPaper ? "text-ink-900" : "text-canvas",
      )}
    >
      <Equalizer
        live={live}
        className={cn("h-[1em] translate-y-[0.04em]", isPaper ? "text-ink-900" : "text-yellow")}
      />
      <span className="font-serif text-[1.5em] italic leading-none tracking-[-0.01em]">
        rvox
      </span>
    </span>
  );

  if (!asLink) {
    return (
      <span className={cn("text-[1.05rem]", className)} aria-label="ORVOX">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label="ORVOX — home"
      className={cn(
        "inline-flex text-[1.05rem] press rounded-md focus-visible:outline-2 focus-visible:outline-offset-4",
        className,
      )}
    >
      {content}
    </Link>
  );
}
