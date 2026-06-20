import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { getEvents } from "@/lib/repo";
import { accentOf, trackLabel } from "@/lib/accent";
import { cn, formatDateRange } from "@/lib/utils";

const dot: Record<string, string> = {
  teal: "bg-teal", yellow: "bg-yellow", rose: "bg-rose-deep", stage: "bg-ink-400",
};

/** Editorial event list — large rows with hover lighting, not a card grid. */
export async function UpcomingEvents() {
  const events = (await getEvents()).filter((e) => e.status !== "closed").slice(0, 5);

  return (
    <section className="relative overflow-hidden bg-void text-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 top-12 h-[30rem] w-[30rem] rounded-full bg-teal opacity-[0.08] blur-[120px]"
      />
      <Section className="relative">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-400">
                <span className="h-1.5 w-1.5 rounded-full bg-live motion-safe-only" style={{ animation: "var(--animate-live-pulse)" }} />
                Now playing
              </span>
              <h2 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl">The season slate.</h2>
            </div>
            <Link href="/events" className="group hidden items-center gap-2 text-sm font-medium text-ink-300 transition-colors hover:text-canvas sm:inline-flex">
              All events
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
            </Link>
          </div>

          <Reveal className="mt-12 border-t border-white/8" stagger={0.06}>
            {events.map((event) => {
              const accent = accentOf(event.accent);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  data-reveal
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-white/8 py-7 transition-colors duration-300 hover:bg-white/[0.025] sm:gap-10"
                >
                  <span className="hidden w-28 font-mono text-[13px] tabular text-ink-400 sm:block">
                    {formatDateRange(event.startDate, event.endDate)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot[event.accent])} />
                      <h3 className="truncate text-2xl font-bold tracking-tight text-canvas transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
                        {event.title}
                      </h3>
                      <span className={cn("hidden font-serif text-xl italic sm:inline", accent.text)}>{event.subtitle}</span>
                    </div>
                    <p className="mt-2 pl-[1.125rem] font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
                      {trackLabel[event.track]} · {event.venue}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-inset ring-white/12 transition-colors duration-300 group-hover:bg-canvas group-hover:text-stage">
                    <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </span>
                </Link>
              );
            })}
          </Reveal>
        </Container>
      </Section>
    </section>
  );
}
