import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";

/** Dead air. The signal lamp is off and the room is dark. */
export default function NotFound() {
  return (
    <main
      id="main"
      className="void-mesh relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center text-canvas"
    >
      <Logo />
      <p className="mt-12 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-400">
        <span className="signal-lamp bg-live" aria-hidden />
        Off air
      </p>
      <p className="mt-4 font-mono text-8xl font-semibold tabular tracking-tighter text-canvas sm:text-9xl">
        404
      </p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-canvas">
        This room's <em className="text-teal">empty.</em>
      </h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-300">
        The page you're after moved, closed, or never existed. Let's get you back to the floor.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
          Back home
        </Link>
        <Link href="/events" className={buttonVariants({ variant: "ghost", size: "lg" })}>
          Browse events
        </Link>
      </div>
    </main>
  );
}
