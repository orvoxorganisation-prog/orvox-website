import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, MapPin, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RegistrationForm } from "@/components/events/registration-form";
import { Reveal } from "@/components/motion/reveal";
import { getEventBySlug, getEventSlugs } from "@/lib/repo";
import { darkAccentOf, trackLabel } from "@/lib/accent";
import { cn, formatDateRange } from "@/lib/utils";
import type { categoryOptions } from "@/lib/validations/registration";
import type { Track } from "@/lib/data/types";

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
    title: `Register · ${event.title}`,
    description: `Register for ${event.title}. ${event.summary}`,
    robots: { index: false, follow: true },
  };
}

const trackToCategory: Record<Track, (typeof categoryOptions)[number] | undefined> = {
  debate: "Debate",
  speaking: "Public speaking",
  pitch: "Pitch",
  oped: undefined,
};

const perks = [
  "Round schedule and motions in your dashboard",
  "Live scores within minutes of each room",
  "Written feedback from the panel that judged you",
];

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const accent = darkAccentOf(event.accent);

  return (
    <div className="spotlight pt-24 text-canvas sm:pt-28">
      <Container>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-400">
          <Link href="/events" className="transition-colors hover:text-canvas">Events</Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-500" strokeWidth={2} />
          <Link href={`/events/${event.slug}`} className="truncate transition-colors hover:text-canvas">{event.title}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-500" strokeWidth={2} />
          <span className="text-ink-200">Register</span>
        </nav>

        <div className="mt-8 grid gap-12 pb-12 lg:grid-cols-[1fr_340px]">
          <Reveal stagger={0.09} start="top 95%">
            <div data-reveal>
              <Eyebrow items={[event.season, trackLabel[event.track], event.city]} />
            </div>
            <h1 data-reveal className="display-2 mt-5 text-canvas">
              Lock your <em className="text-teal">seat.</em>
            </h1>
            <p data-reveal className="mt-4 max-w-md text-lg leading-relaxed text-ink-300">
              One form, two minutes. You'll get a confirmation and everything you need
              to walk in ready.
            </p>

            <div data-reveal className="mt-10">
              <RegistrationForm
                slug={event.slug}
                eventTitle={event.title}
                defaultCategory={trackToCategory[event.track]}
              />
            </div>
          </Reveal>

          {/* The board you're being added to */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal y={28} className="shell r-shell p-1.5">
              <div className="core r-core relative isolate overflow-hidden">
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full opacity-20 blur-[70px]",
                    accent.dot,
                  )}
                />
                <div className="p-6">
                  <Eyebrow>You're registering for</Eyebrow>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-canvas">{event.title}</h2>
                  <p className={cn("font-serif text-xl italic", accent.text)}>{event.subtitle}</p>

                  <dl className="mt-5 space-y-3 text-sm text-ink-300">
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

                <div className="border-t border-white/10 bg-white/[0.03] p-6">
                  <p className="eyebrow">What you get</p>
                  <ul className="mt-4 space-y-3">
                    {perks.map((perk) => (
                      <li key={perk} className="flex gap-3 text-[13.5px] leading-relaxed text-ink-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </Container>
    </div>
  );
}
