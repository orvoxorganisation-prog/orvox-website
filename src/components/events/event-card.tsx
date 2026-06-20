import Link from "next/link";
import { Calendar, MapPin, ArrowRight, ArrowUpRight } from "lucide-react";
import type { OrvoxEvent } from "@/lib/data/types";
import { darkAccentOf, trackLabel } from "@/lib/accent";
import { cn, formatDateRange } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EventStatusBadge } from "./event-status-badge";

export function SeatMeter({ event, className }: { event: OrvoxEvent; className?: string }) {
  const pct = Math.min(100, Math.round((event.seatsFilled / event.seatsTotal) * 100));
  const left = event.seatsTotal - event.seatsFilled;
  const full = left <= 0;
  const accent = darkAccentOf(event.accent);
  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full", full ? "bg-ink-500" : accent.dot)}
          style={{ width: `${full ? 100 : Math.max(6, pct)}%` }}
        />
      </div>
      <p className="font-mono text-[11px] tabular text-ink-400">
        {full ? "Full · join waitlist" : `${left} of ${event.seatsTotal} seats left`}
      </p>
    </div>
  );
}

/**
 * Event surfaces, broadcast-style:
 * - `billboard` — the full-width fight card for a flagship event.
 * - `row` — fixture-ledger row for listings.
 * - `compact` — dense console row for in-app lists.
 * - `default` — dark panel card for grids.
 */
export function EventCard({
  event,
  variant = "default",
  className,
}: {
  event: OrvoxEvent;
  variant?: "default" | "billboard" | "row" | "compact";
  className?: string;
}) {
  const accent = darkAccentOf(event.accent);
  const href = `/events/${event.slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center justify-between gap-4 rounded-card panel px-4 py-3.5 transition-[border-color,background-color] duration-200 hover:border-white/20",
          className,
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-canvas">{event.title}</p>
          <p className="mt-0.5 font-mono text-[11px] tabular text-ink-400">
            {formatDateRange(event.startDate, event.endDate)} · {event.city}
          </p>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-canvas"
          strokeWidth={1.75}
        />
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link
        href={href}
        className={cn(
          "group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-b border-white/8 py-6 transition-colors duration-300 hover:bg-white/[0.025] sm:grid-cols-[8.5rem_1fr_11rem_auto] sm:gap-8 sm:py-7",
          className,
        )}
      >
        <span className="hidden font-mono text-[13px] tabular leading-snug text-ink-400 sm:block">
          {formatDateRange(event.startDate, event.endDate)}
          <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-ink-500">
            {event.city}
          </span>
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-xl font-bold tracking-tight text-canvas transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
              {event.title}
            </h3>
            <span className={cn("font-serif text-lg italic", accent.text)}>{event.subtitle}</span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            {trackLabel[event.track]} · {event.venue}
          </p>
          <p className="mt-2 font-mono text-[12px] tabular text-ink-400 sm:hidden">
            {formatDateRange(event.startDate, event.endDate)}
          </p>
        </div>

        <div className="hidden sm:block">
          <SeatMeter event={event} />
        </div>

        <div className="col-start-2 row-start-1 flex items-center gap-3 sm:col-start-4">
          <EventStatusBadge status={event.status} deadline={event.registrationDeadline} size="sm" />
          <span className="hidden h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset ring-white/12 transition-colors duration-300 group-hover:bg-canvas group-hover:text-ink-900 lg:flex">
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "billboard") {
    return (
      <Link
        href={href}
        className={cn(
          "group relative isolate block overflow-hidden rounded-feature panel-raised p-7 transition-[border-color] duration-300 hover:border-white/20 sm:p-10",
          className,
        )}
      >
        {/* accent light source baked into the board */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full opacity-25 blur-[80px]",
            accent.dot,
          )}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <EventStatusBadge status={event.status} deadline={event.registrationDeadline} />
          <Eyebrow items={[event.season, trackLabel[event.track], event.city]} />
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-8 sm:mt-16">
          <div className="min-w-0 max-w-2xl">
            <h3 className="display-2 text-canvas">{event.title}</h3>
            <p className={cn("mt-2 font-serif text-2xl italic", accent.text)}>{event.subtitle}</p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-300">{event.summary}</p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={1.75} />
                <dd className="font-mono text-[13px] tabular">
                  {formatDateRange(event.startDate, event.endDate)}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={1.75} />
                <dd>{event.venue}</dd>
              </div>
            </dl>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-5 sm:w-64">
            <SeatMeter event={event} />
            <span
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 self-start rounded-full px-6 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-0.5",
                accent.solid,
              )}
              aria-hidden
            >
              View the card
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group lift relative flex flex-col overflow-hidden rounded-card panel p-6 hover:border-white/20",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <EventStatusBadge status={event.status} deadline={event.registrationDeadline} size="sm" />
        <Eyebrow items={[event.season, trackLabel[event.track]]} />
      </div>

      <div className="mt-auto pt-10">
        <h3 className="text-xl font-bold tracking-tight text-canvas">{event.title}</h3>
        <p className={cn("mt-1 font-serif text-xl italic", accent.text)}>{event.subtitle}</p>

        <dl className="mt-5 grid gap-2 text-sm text-ink-300">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={1.75} />
            <dd className="font-mono text-[13px] tabular">
              {formatDateRange(event.startDate, event.endDate)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={1.75} />
            <dd>{event.venue}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <SeatMeter event={event} />
          </div>
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-canvas transition-colors duration-200 group-hover:bg-canvas group-hover:text-ink-900"
            aria-hidden
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
