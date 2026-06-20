import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, MapPin, GraduationCap, Trophy, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Equalizer } from "@/components/ui/equalizer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { EventDetailTabs } from "@/components/events/event-detail-tabs";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { Countdown } from "@/components/motion/countdown";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { EventJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getEventBySlug, getEventSlugs } from "@/lib/repo";
import { darkAccentOf, trackLabel } from "@/lib/accent";
import { cn, formatDateRange, formatINR, daysUntil } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: { title: `${event.title} — ORVOX`, description: event.summary },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const accent = darkAccentOf(event.accent);
  const seatsLeft = event.seatsTotal - event.seatsFilled;
  const full = seatsLeft <= 0;
  const closes = daysUntil(event.registrationDeadline);

  const facts = [
    { Icon: Calendar, label: "Dates", value: formatDateRange(event.startDate, event.endDate) },
    { Icon: MapPin, label: "Where", value: event.venue },
    { Icon: GraduationCap, label: "Eligibility", value: event.eligibility },
    ...(event.prizePool
      ? [{ Icon: Trophy, label: "Prize pool", value: formatINR(event.prizePool) }]
      : []),
  ];

  return (
    <>
      <EventJsonLd event={event} />
      <BreadcrumbJsonLd
        items={[
          { name: "Events", href: "/events" },
          { name: event.title, href: `/events/${event.slug}` },
        ]}
      />

      <div className="spotlight pt-24 text-canvas sm:pt-28">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-400">
            <Link href="/events" className="transition-colors hover:text-canvas">Events</Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-500" strokeWidth={2} />
            <span className="truncate text-ink-200">{event.title}</span>
          </nav>

          {/* Broadside masthead */}
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <Reveal className="flex flex-col" stagger={0.08} start="top 95%">
              <div data-reveal className="flex flex-wrap items-center gap-2">
                <EventStatusBadge status={event.status} deadline={event.registrationDeadline} />
                <Badge variant="ghost">{event.format}</Badge>
                <Badge variant="ghost">{event.mode}</Badge>
              </div>
              <h1 data-reveal className="display-1 mt-6 text-canvas">{event.title}</h1>
              <p data-reveal className={cn("mt-3 font-serif text-3xl italic", accent.text)}>
                {event.subtitle}
              </p>
              <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">{event.summary}</p>

              <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8">
                {facts.map((fact) => (
                  <div key={fact.label} data-reveal className="flex items-start gap-3">
                    <fact.Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-400" strokeWidth={1.75} />
                    <div>
                      <dt className="eyebrow">{fact.label}</dt>
                      <dd className="mt-1 text-sm font-medium text-ink-200">{fact.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div data-reveal className="mt-auto flex flex-wrap items-center gap-3 pt-9">
                <Link
                  href={`/events/${event.slug}/register`}
                  className={buttonVariants({ variant: full ? "ghost" : "yellow", size: "lg" })}
                >
                  {full ? "Join waitlist" : "Register now"}
                </Link>
                <ShareButton title={`${event.title} — ORVOX`} text={event.summary} />
              </div>
            </Reveal>

            {/* Poster board — the event as a broadcast graphic */}
            <Reveal y={36} start="top 95%" className="relative isolate flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-feature panel-raised p-8 sm:p-10">
              <Parallax
                speed={50}
                className={cn(
                  "pointer-events-none absolute -right-28 -top-28 -z-10 h-96 w-96 rounded-full opacity-25 blur-[90px]",
                  accent.dot,
                )}
              >
                <span aria-hidden />
              </Parallax>
              <div className="flex items-center justify-between">
                <Eyebrow items={[event.season, trackLabel[event.track], event.city]} />
                <Equalizer live={event.status === "live"} className={cn("h-5", accent.text)} />
              </div>
              <div>
                <div className="font-mono text-7xl font-semibold tabular leading-none tracking-tight text-canvas sm:text-8xl">
                  {event.heroStat.value}
                </div>
                <div className="eyebrow mt-3">{event.heroStat.label}</div>
              </div>
            </Reveal>
          </div>

          {/* Body + glass register rail */}
          <div className="mt-20 grid gap-12 pb-12 lg:grid-cols-[1fr_330px]">
            <Reveal>
              <EventDetailTabs event={event} />
            </Reveal>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Reveal y={28} className="shell r-shell p-1.5">
                <div className="core r-core p-6">
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow">Entry</span>
                    <span className="text-sm font-semibold text-success">Free</span>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-ink-400">Seats</span>
                      <span className="font-mono tabular text-ink-200">
                        {full ? "Full" : `${seatsLeft} left`}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn("h-full rounded-full", full ? "bg-ink-500" : accent.dot)}
                        style={{ width: `${Math.max(6, Math.round((event.seatsFilled / event.seatsTotal) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-5">
                    <div className="flex items-center gap-2 text-sm text-ink-400">
                      <Clock className="h-4 w-4" strokeWidth={1.75} />
                      {closes > 0 ? "Registration closes in" : "Registration closed"}
                    </div>
                    {closes > 0 && (
                      <div className="mt-3 text-canvas">
                        <Countdown target={event.registrationDeadline} />
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/events/${event.slug}/register`}
                    className={cn(buttonVariants({ variant: full ? "ghost" : "yellow", size: "lg" }), "mt-6 w-full")}
                  >
                    {full ? "Join waitlist" : "Register now"}
                  </Link>
                  <p className="mt-3 text-center text-[12px] text-ink-400">
                    Takes two minutes. Confirmation by email.
                  </p>
                </div>
              </Reveal>
            </aside>
          </div>
        </Container>
      </div>
    </>
  );
}
