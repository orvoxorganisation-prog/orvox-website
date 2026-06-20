import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { Reveal } from "@/components/motion/reveal";
import { requireAccount, getEvents } from "@/lib/repo";
import { darkAccentOf, trackLabel } from "@/lib/accent";
import { cn, formatDate, formatTime } from "@/lib/utils";

export const metadata: Metadata = { title: "My registrations", robots: { index: false } };

export default async function RegistrationsPage() {
  const [account, events] = await Promise.all([requireAccount(), getEvents()]);
  const rows = account.registrations
    .map((reg) => ({ reg, event: events.find((e) => e.slug === reg.eventSlug) }))
    .filter((r): r is { reg: (typeof account.registrations)[number]; event: NonNullable<typeof r.event> } => Boolean(r.event));

  return (
    <div className="mx-auto max-w-4xl">
      <DashHeader
        title="My registrations"
        description="Every seat you've locked this season, with your next round up front."
      />

      {rows.length === 0 && (
        <div className="flex flex-col items-start rounded-feature border border-dashed border-white/12 bg-white/[0.02] p-8">
          <p className="text-lg font-semibold tracking-tight text-canvas">No seats locked yet.</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-400">
            When you register for an event it shows up here with your round
            schedule and status.
          </p>
          <Link
            href="/events"
            className="press mt-6 inline-flex h-10 items-center rounded-full bg-yellow px-5 text-sm font-semibold text-ink-900"
          >
            Browse the season slate
          </Link>
        </div>
      )}

      {/* Fixture list */}
      {rows.length > 0 && (
      <Reveal as="ul" stagger={0.06} className="overflow-hidden rounded-feature panel">
        {rows.map(({ reg, event }, i) => {
          const accent = darkAccentOf(event.accent);
          const confirmed = reg.status === "confirmed";
          return (
            <li
              key={reg.eventSlug}
              data-reveal
              className={cn(i > 0 && "border-t border-white/8")}
            >
              <div className="flex flex-col gap-4 p-6 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold uppercase ring-1 ring-inset",
                      accent.dim,
                      accent.text,
                      accent.border,
                    )}
                    aria-hidden
                  >
                    {trackLabel[event.track].slice(0, 2)}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-semibold tracking-tight text-canvas">{event.title}</h3>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">
                        <span
                          className={cn(
                            "signal-lamp",
                            confirmed ? "bg-teal" : "bg-warning",
                          )}
                          aria-hidden
                        />
                        <span className={confirmed ? "text-teal" : "text-warning"}>
                          {confirmed ? "Confirmed" : "Waitlist"}
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[12px] uppercase tracking-wide text-ink-400">
                      {event.season} · {trackLabel[event.track]} · registered {formatDate(reg.registeredAt)}
                    </p>
                    {reg.nextRound && (
                      <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-ink-300">
                        <Clock className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
                        Next: <span className="font-medium text-canvas">{reg.nextRound.label}</span>
                        <span className="font-mono tabular text-ink-400">
                          · {formatDate(reg.nextRound.date)}, {formatTime(reg.nextRound.date)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/events/${event.slug}`}
                  className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-4 py-2 text-[13px] font-medium text-ink-300 ring-1 ring-inset ring-white/12 transition-colors hover:bg-white/5 hover:text-canvas sm:self-auto"
                >
                  View event
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                </Link>
              </div>
            </li>
          );
        })}
      </Reveal>
      )}
    </div>
  );
}
