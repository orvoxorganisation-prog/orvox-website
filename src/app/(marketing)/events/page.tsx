import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EventsExplorer } from "@/components/events/events-explorer";
import { WebPageJsonLd, ItemListJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getEvents } from "@/lib/repo";
import type { Track } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Every ORVOX competition this season — debate, public speaking, pitch, and op-ed. Filter by track and register before the room fills.",
  alternates: { canonical: "/events" },
};

const validTracks: Track[] = ["debate", "speaking", "pitch", "oped"];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const events = await getEvents();
  const initialTrack = validTracks.includes(track as Track) ? (track as Track) : "all";

  return (
    <>
      <WebPageJsonLd
        path="/events"
        title="ORVOX Events — debate & public speaking competitions"
        description="Every ORVOX competition this season: debate, public speaking, pitch, and op-ed."
        type="CollectionPage"
        breadcrumb={[{ name: "Events", href: "/events" }]}
      />
      <ItemListJsonLd
        name="ORVOX events this season"
        items={events.map((e) => ({ name: e.title, href: `/events/${e.slug}` }))}
      />
      <BreadcrumbJsonLd items={[{ name: "Events", href: "/events" }]} />
      <PageHeader
        eyebrow="S03 · season slate"
        tint="teal"
        title="Every room, one season."
        description="Debate, speaking, pitch, and op-ed. Pick a track, read the brief, and register before the seats run out."
      />
      <Container className="py-12 sm:py-16">
        <EventsExplorer events={events} initialTrack={initialTrack} />
      </Container>
    </>
  );
}
