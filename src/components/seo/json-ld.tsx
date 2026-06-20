import { siteConfig } from "@/lib/site";
import type { OrvoxEvent } from "@/lib/data/types";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is static + trusted; safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/favicon.svg`,
        description: siteConfig.description,
        email: siteConfig.email,
        areaServed: "IN",
        sameAs: Object.values(siteConfig.socials),
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
      }}
    />
  );
}

export function EventJsonLd({ event }: { event: OrvoxEvent }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${event.title} — ${siteConfig.name}`,
        description: event.summary,
        startDate: event.startDate,
        endDate: event.endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode:
          event.mode === "Online"
            ? "https://schema.org/OnlineEventAttendanceMode"
            : event.mode === "Hybrid"
              ? "https://schema.org/MixedEventAttendanceMode"
              : "https://schema.org/OfflineEventAttendanceMode",
        location:
          event.mode === "Online"
            ? { "@type": "VirtualLocation", url: `${siteConfig.url}/events/${event.slug}` }
            : { "@type": "Place", name: event.venue, address: event.city },
        organizer: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        url: `${siteConfig.url}/events/${event.slug}`,
        ...(event.prizePool
          ? { offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" } }
          : {}),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${siteConfig.url}${item.href}`,
        })),
      }}
    />
  );
}
