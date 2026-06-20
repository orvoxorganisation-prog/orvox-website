"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would report to an error tracker.
    console.error(error);
  }, [error]);

  return (
    <main
      id="main"
      className="void-mesh flex min-h-svh flex-col items-center justify-center px-6 text-center text-canvas"
    >
      <Logo />
      <p className="mt-12 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-400">
        <span className="signal-lamp bg-warning" aria-hidden />
        Technical difficulties
      </p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-canvas">
        Something <em className="text-rose-deep">broke.</em>
      </h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-300">
        That's on us, not you. Try again, and if it keeps happening, let us know.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} size="lg" className="group">
          <RotateCw className="h-4 w-4 transition-transform group-hover:-rotate-45" strokeWidth={2} />
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "lg" })}>
          Back home
        </Link>
      </div>
    </main>
  );
}
