import { Hero } from "@/components/sections/hero";
import { MarqueeStrip } from "@/components/sections/marquee-strip";
import { UpcomingEvents } from "@/components/sections/upcoming-events";
import { Tracks } from "@/components/sections/tracks";
import { ScrollStory } from "@/components/sections/scroll-story";
import { JudgesBand } from "@/components/sections/judges-band";
import { Proof } from "@/components/sections/proof";
import { ResourcesTeaser } from "@/components/sections/resources-teaser";
import { ClosingCta } from "@/components/sections/closing-cta";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { getEvents } from "@/lib/repo";
import { formatINR } from "@/lib/utils";

export default async function HomePage() {
  const all = await getEvents();
  const order = ["debate-championship-2026", "public-speaking-contest", "founders-demo-day"];
  const heroEvents = order
    .map((slug) => all.find((e) => e.slug === slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  // Season facts derived from the slate itself — never hand-typed numbers.
  const cities = new Set(all.map((e) => e.city)).size;
  const seats = all.reduce((sum, e) => sum + e.seatsTotal, 0);
  const pool = all.reduce((sum, e) => sum + (e.prizePool ?? 0), 0);
  const tape = [
    { value: String(cities), label: "cities" },
    { value: String(seats), label: "seats" },
    ...(pool > 0 ? [{ value: formatINR(pool), label: "prize pool" }] : []),
  ];

  return (
    <div className="bg-void text-canvas">
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <Hero events={heroEvents} tape={tape} />
      <MarqueeStrip />
      <UpcomingEvents />
      <Tracks />
      <ScrollStory />
      <JudgesBand />
      <Proof />
      <ResourcesTeaser />
      <ClosingCta />
    </div>
  );
}
