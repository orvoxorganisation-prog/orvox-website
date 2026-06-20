import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { EventCard } from "@/components/events/event-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { requireAccount, getEvents } from "@/lib/repo";

export const metadata: Metadata = { title: "Events", robots: { index: false } };

export default async function DashboardEventsPage() {
  const [account, events] = await Promise.all([requireAccount(), getEvents()]);
  const registeredSlugs = new Set(account.registrations.map((r) => r.eventSlug));
  const registered = events.filter((e) => registeredSlugs.has(e.slug));
  const discover = events.filter((e) => !registeredSlugs.has(e.slug) && e.status !== "closed");

  return (
    <div className="mx-auto max-w-5xl">
      <DashHeader
        title="Events"
        description="Everything you're entered in, plus the rooms still open."
        actions={
          <Link href="/events" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            All events
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        }
      />

      <section aria-label="Registered">
        <Eyebrow>You're in</Eyebrow>
        {registered.length > 0 ? (
          <Reveal stagger={0.07} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {registered.map((event) => (
              <div key={event.id} data-reveal>
                <EventCard event={event} className="h-full" />
              </div>
            ))}
          </Reveal>
        ) : (
          <p className="mt-4 max-w-md rounded-card border border-dashed border-white/12 bg-white/[0.02] p-5 text-sm leading-relaxed text-ink-400">
            Nothing yet. Pick a room below and lock your first seat of the season.
          </p>
        )}
      </section>

      <section aria-label="Discover" className="mt-12">
        <Eyebrow>Still open</Eyebrow>
        <Reveal stagger={0.07} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discover.map((event) => (
            <div key={event.id} data-reveal>
              <EventCard event={event} className="h-full" />
            </div>
          ))}
        </Reveal>
      </section>
    </div>
  );
}
