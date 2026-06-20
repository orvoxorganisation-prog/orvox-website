import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  Medal,
  ArrowRight,
  MapPin,
  Clock,
  Calendar,
  Bell,
  MessageSquare,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Countdown } from "@/components/motion/countdown";
import { Reveal } from "@/components/motion/reveal";
import { requireAccount, getEvents } from "@/lib/repo";
import { darkAccentOf, trackLabel } from "@/lib/accent";
import { cn, formatDate, formatDateRange, formatTime } from "@/lib/utils";
import type { AnnouncementType } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const announcementIcon: Record<AnnouncementType, typeof Bell> = {
  schedule: CalendarClock,
  result: Medal,
  reminder: Bell,
  feedback: MessageSquare,
};

export default async function DashboardPage() {
  const [account, events] = await Promise.all([requireAccount(), getEvents()]);
  const firstName = account.name.split(" ")[0];

  const nextReg = account.registrations[0];
  const nextEvent = nextReg ? events.find((e) => e.slug === nextReg.eventSlug) : undefined;
  const accent = nextEvent ? darkAccentOf(nextEvent.accent) : darkAccentOf("teal");

  const tape = [
    { value: String(account.stats.rounds).padStart(2, "0"), label: "rounds spoken" },
    { value: account.stats.bestRank ? `#${account.stats.bestRank}` : "·", label: "best rank" },
    { value: account.stats.speakerAvg ? String(account.stats.speakerAvg) : "·", label: "speaker avg" },
    { value: String(account.registrations.length).padStart(2, "0"), label: "events entered" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Greeting + season tape */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-canvas sm:text-4xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-[15px] text-ink-400">Here's where you stand this season.</p>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-7 gap-y-3 border-t border-white/8 pt-4 lg:border-t-0 lg:pt-0">
          {tape.map((s) => (
            <span key={s.label} className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-semibold tabular leading-none text-canvas">{s.value}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* The room you're due in */}
        <Reveal as="section" y={24} start="top 95%" aria-label="Your next event">
          {nextEvent && nextReg ? (
            <div className="relative isolate overflow-hidden rounded-feature panel-raised">
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full opacity-20 blur-[80px]",
                  accent.dot,
                )}
              />
              <div className="flex items-start justify-between gap-4 p-7 pb-0 sm:p-8 sm:pb-0">
                <div>
                  <Eyebrow items={["Up next", nextEvent.season, trackLabel[nextEvent.track]]} />
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-canvas">{nextEvent.title}</h2>
                  <p className={cn("mt-1 font-serif text-xl italic", accent.text)}>
                    {nextEvent.subtitle}
                  </p>
                </div>
                <Badge variant="success" size="sm">Confirmed</Badge>
              </div>

              <div className="p-7 sm:p-8">
                <dl className="grid grid-cols-1 gap-3 text-sm text-ink-300 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ink-400" strokeWidth={1.75} />
                    <dd className="font-mono text-[13px] tabular">
                      {formatDateRange(nextEvent.startDate, nextEvent.endDate)}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ink-400" strokeWidth={1.75} />
                    <dd>{nextEvent.mode}</dd>
                  </div>
                </dl>

                {nextReg.nextRound && (
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-card bg-white/[0.04] p-5 ring-1 ring-inset ring-white/8">
                    <div>
                      <p className="flex items-center gap-2 text-sm text-ink-400">
                        <Clock className="h-4 w-4" strokeWidth={1.75} />
                        {nextReg.nextRound.label}
                      </p>
                      <p className="mt-1.5 font-mono text-[13px] tabular text-ink-300">
                        {formatDate(nextReg.nextRound.date)} · {formatTime(nextReg.nextRound.date)}
                      </p>
                    </div>
                    <div className={accent.text}>
                      <Countdown target={nextReg.nextRound.date} closedLabel="In session" />
                    </div>
                  </div>
                )}

                <Link
                  href={`/events/${nextEvent.slug}`}
                  className={cn(buttonVariants({ variant: "primary", size: "md" }), "group mt-6")}
                >
                  View details
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-start justify-center rounded-feature border border-dashed border-white/12 bg-white/[0.02] p-8">
              <Eyebrow>Up next</Eyebrow>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-300">
                No upcoming events yet. The season slate is open and seats are moving.
              </p>
              <Link href="/events" className={cn(buttonVariants({ variant: "yellow", size: "md" }), "mt-6")}>
                Browse events
              </Link>
            </div>
          )}
        </Reveal>

        {/* The wire */}
        <Reveal as="section" y={24} start="top 95%" id="announcements" aria-label="Announcements" className="scroll-mt-24">
          <div className="flex h-full flex-col rounded-feature panel">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <Eyebrow live>The wire</Eyebrow>
              <span className="font-mono text-[11px] tabular text-ink-400">
                {account.announcements.length} new
              </span>
            </div>
            <ul className="flex-1 divide-y divide-white/6 px-6">
              {account.announcements.map((a) => {
                const Icon = announcementIcon[a.type];
                return (
                  <li key={a.id}>
                    <Link href={a.href ?? "#"} className="group flex gap-3.5 py-4 transition-colors">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-500 transition-colors group-hover:text-teal" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug tracking-tight text-canvas">
                          {a.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-ink-400">
                          {a.body}
                        </p>
                        <p className="mt-1.5 font-mono text-[11px] tabular text-ink-400">
                          {formatDate(a.date)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
