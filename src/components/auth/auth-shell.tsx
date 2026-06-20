import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Equalizer } from "@/components/ui/equalizer";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { BrandTicker } from "./brand-ticker";

/**
 * The stage door. One dark glass console on the void: form on the core plate,
 * the live season ticker beside it. No theme flip at the threshold.
 */
export function AuthShell({
  children,
  heading,
  sub,
}: {
  children: React.ReactNode;
  heading: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="void-mesh relative flex min-h-svh flex-col px-5 py-6 text-canvas sm:px-10">
      <div className="flex items-center justify-between">
        <Logo />
        <Eyebrow live>S03 · applications live</Eyebrow>
      </div>

      <div className="flex flex-1 items-center justify-center py-12">
        <Reveal y={30} className="shell r-shell w-full max-w-4xl p-1.5">
          <div className="core r-core grid overflow-hidden lg:grid-cols-[1fr_0.85fr]">
            {/* Form plate */}
            <div className="p-8 sm:p-12">
              <h1 className="text-3xl font-bold tracking-tight text-canvas">{heading}</h1>
              <p className="mt-2 text-[15px] text-ink-400">{sub}</p>
              <div className="mt-8">{children}</div>
            </div>

            {/* Brand panel — the room you're walking into */}
            <div className="relative hidden flex-col justify-between overflow-hidden border-l border-white/8 bg-white/[0.02] p-10 lg:flex">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-teal opacity-15 blur-[80px]"
              />
              <h2 className="display text-3xl text-canvas">
                Argue <em className="text-yellow">better.</em>
                <br />
                Win <em className="text-teal">louder.</em>
              </h2>

              <BrandTicker />

              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
                <Equalizer className="h-3 text-yellow" />
                orvox.in/s03
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <p className="text-center text-[12px] text-ink-400 lg:text-left">
        <Link href="/" className="transition-colors hover:text-ink-200">← Back to orvox.in</Link>
      </p>
    </div>
  );
}
