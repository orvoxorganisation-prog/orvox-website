import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { getEvents } from "@/lib/repo";
import { formatINR, cn } from "@/lib/utils";
import type { Track } from "@/lib/data/types";

interface TrackCard {
  track: Track;
  tag: string;
  title: string;
  verb: string;
  blurb: string;
  href: string;
  span: string;
  text: string;
  bar: string;
  hover: string;
  /** Per-track tinted surface so the grid reads as four signals, not one slab. */
  wash: string;
}

const tracks: TrackCard[] = [
  {
    track: "debate", tag: "BP · MUN", title: "Debate.", verb: "argue.",
    blurb: "British and Asian Parliamentary, plus committee. Real motions, fast breaks.",
    href: "/events?track=debate",
    span: "lg:col-span-7", text: "text-teal", bar: "bg-teal", hover: "hover:border-teal/40",
    wash: "bg-gradient-to-br from-teal/[0.08] to-transparent",
  },
  {
    track: "pitch", tag: "Demo Days", title: "Pitch.", verb: "build.",
    blurb: "Student founders pitch shipped products to operators who write real cheques.",
    href: "/events?track=pitch",
    span: "lg:col-span-5", text: "text-yellow", bar: "bg-yellow", hover: "hover:border-yellow/40",
    wash: "bg-gradient-to-br from-yellow/[0.07] to-transparent",
  },
  {
    track: "speaking", tag: "Stagecraft", title: "Speaking.", verb: "say it.",
    blurb: "Prepared, impromptu, and a main-stage final under lights that don't blink.",
    href: "/events?track=speaking",
    span: "lg:col-span-5", text: "text-rose-deep", bar: "bg-rose-deep", hover: "hover:border-rose-deep/40",
    wash: "bg-gradient-to-br from-rose-deep/[0.07] to-transparent",
  },
  {
    track: "oped", tag: "Op-Ed", title: "Write.", verb: "ship it.",
    blurb: "One prompt, forty-eight hours, eight hundred words. Editors score the best onto the wall.",
    href: "/events?track=oped",
    span: "lg:col-span-7", text: "text-canvas", bar: "bg-white/40", hover: "hover:border-white/30",
    wash: "bg-gradient-to-br from-white/[0.05] to-transparent",
  },
];

/** Per-track facts come from the slate: prize pool when one exists, else seats. */
function trackStat(events: Awaited<ReturnType<typeof getEvents>>, track: Track) {
  const inTrack = events.filter((e) => e.track === track);
  const pool = inTrack.reduce((sum, e) => sum + (e.prizePool ?? 0), 0);
  if (pool > 0) return { stat: formatINR(pool), statLabel: "prize pool" };
  const seats = inTrack.reduce((sum, e) => sum + e.seatsTotal, 0);
  return { stat: String(seats), statLabel: "seats this season" };
}

export async function Tracks() {
  const events = await getEvents();
  return (
    <section className="bg-void text-canvas">
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
            <h2 className="max-w-2xl text-5xl font-bold tracking-tight sm:text-6xl">
              Four tracks. <em className="text-teal">One</em> forum.
            </h2>
            <p className="max-w-xs text-[15px] leading-relaxed text-ink-400">
              Pick a lane or run all four. Every track ends in a room with a result.
            </p>
          </div>

          <Reveal className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12" stagger={0.08}>
            {tracks.map((track) => {
              const { stat, statLabel } = trackStat(events, track.track);
              return (
              <Link
                key={track.title}
                href={track.href}
                data-reveal
                className={cn(
                  "group relative flex min-h-[16rem] flex-col overflow-hidden rounded-card border border-white/10 p-8 transition-[transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/[0.03]",
                  track.wash,
                  track.span,
                  track.hover,
                )}
              >
                {/* accent rule */}
                <span className={cn("absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-x-100", track.bar)} />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-400">{track.tag}</span>
                  <ArrowUpRight className={cn("h-5 w-5 opacity-30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100", track.text)} strokeWidth={1.5} />
                </div>

                <div className="mt-10 flex items-baseline gap-3">
                  <h3 className="text-4xl font-bold tracking-tight text-canvas">{track.title}</h3>
                  <p className={cn("font-serif text-3xl italic", track.text)}>{track.verb}</p>
                </div>
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink-400">{track.blurb}</p>

                <div className="mt-auto flex items-end gap-3 border-t border-white/8 pt-6">
                  <span className="font-mono text-4xl font-semibold tabular tracking-tight text-canvas">{stat}</span>
                  <span className="pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">{statLabel}</span>
                </div>
              </Link>
              );
            })}
          </Reveal>
        </Container>
      </Section>
    </section>
  );
}
