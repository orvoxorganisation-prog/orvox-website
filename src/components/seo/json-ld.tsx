import { siteConfig, orgTopics, contactPoints } from "@/lib/site";
import type { OrvoxEvent } from "@/lib/data/types";

const ORG_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Escape characters that could break out of the <script> context. Some fields
  // (event titles, FAQ answers, etc.) are admin-editable, so never trust them to
  // be free of "</script>" or HTML-significant characters.
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/[\u2028]/g, "\\u2028")
    .replace(/[\u2029]/g, "\\u2029");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Absolute URL helper — schema requires fully-qualified URLs. */
function abs(path: string): string {
  return path.startsWith("http") ? path : `${siteConfig.url}${path}`;
}

/**
 * Organization graph — the root entity every other node references via @id.
 * Typed as EducationalOrganization so AI/search understands ORVOX as an
 * education-sector entity, with ContactPoint, address, and knowsAbout for
 * topical authority.
 */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["Organization", "EducationalOrganization"],
        "@id": ORG_ID,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: siteConfig.logo,
          contentUrl: siteConfig.logo,
        },
        image: siteConfig.ogImage,
        description: siteConfig.description,
        slogan: siteConfig.tagline,
        email: siteConfig.email,
        foundingDate: siteConfig.foundingYear,
        areaServed: { "@type": "Country", name: "India" },
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.city,
          addressRegion: siteConfig.region,
          addressCountry: siteConfig.country,
        },
        knowsAbout: [...orgTopics],
        contactPoint: contactPoints.map((c) => ({
          "@type": "ContactPoint",
          contactType: c.contactType,
          email: c.email,
          availableLanguage: [...c.availableLanguage],
          areaServed: c.areaServed,
        })),
        sameAs: Object.values(siteConfig.socials),
      }}
    />
  );
}

/** WebSite node — wires the site to the org and declares the search target. */
export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}/events?track={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** Generic WebPage / CollectionPage node tied to the org + breadcrumb. */
export function WebPageJsonLd({
  path,
  title,
  description,
  type = "WebPage",
  breadcrumb,
}: {
  path: string;
  title: string;
  description: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "FAQPage";
  breadcrumb?: { name: string; href: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": type,
        "@id": `${abs(path)}#webpage`,
        url: abs(path),
        name: title,
        description,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        inLanguage: "en-IN",
        ...(breadcrumb
          ? {
              breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: breadcrumb.map((item, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: item.name,
                  item: abs(item.href),
                })),
              },
            }
          : {}),
      }}
    />
  );
}

/** Maps the domain status to a schema.org event status enum. */
function schemaEventStatus(status: OrvoxEvent["status"]): string {
  switch (status) {
    case "live":
      return "https://schema.org/EventScheduled";
    case "closed":
      return "https://schema.org/EventScheduled";
    default:
      return "https://schema.org/EventScheduled";
  }
}

/**
 * Event schema — rich-result eligible. Includes attendance mode, location,
 * organizer, free-entry offer with a real registration URL + validity window,
 * the organising contact as a Person performer, intended audience, and image.
 */
export function EventJsonLd({ event }: { event: OrvoxEvent }) {
  const eventUrl = `${siteConfig.url}/events/${event.slug}`;
  const isFree = true; // entry to ORVOX events is free
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${event.title} — ${siteConfig.name}`,
        description: event.summary,
        startDate: event.startDate,
        endDate: event.endDate,
        eventStatus: schemaEventStatus(event.status),
        eventAttendanceMode:
          event.mode === "Online"
            ? "https://schema.org/OnlineEventAttendanceMode"
            : event.mode === "Hybrid"
              ? "https://schema.org/MixedEventAttendanceMode"
              : "https://schema.org/OfflineEventAttendanceMode",
        location:
          event.mode === "Online"
            ? { "@type": "VirtualLocation", url: eventUrl }
            : {
                "@type": "Place",
                name: event.venue,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: event.city,
                  addressCountry: "IN",
                },
              },
        ...(event.mode === "Hybrid"
          ? {
              location: [
                { "@type": "VirtualLocation", url: eventUrl },
                {
                  "@type": "Place",
                  name: event.venue,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: event.city,
                    addressCountry: "IN",
                  },
                },
              ],
            }
          : {}),
        image: [siteConfig.ogImage],
        url: eventUrl,
        inLanguage: "en-IN",
        isAccessibleForFree: isFree,
        organizer: { "@id": ORG_ID, "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        performer: {
          "@type": "Organization",
          name: event.contact.name,
        },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
          audienceType: event.eligibility,
        },
        offers: {
          "@type": "Offer",
          url: `${eventUrl}/register`,
          price: "0",
          priceCurrency: "INR",
          availability:
            event.seatsFilled >= event.seatsTotal
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
          validFrom: event.startDate,
          category: "Free",
        },
        ...(event.prizePool
          ? {
              about: `Prize pool of ₹${event.prizePool.toLocaleString("en-IN")}`,
            }
          : {}),
      }}
    />
  );
}

/** Article schema for resource/library pages — eligible for article rich results. */
export function ArticleJsonLd({
  title,
  description,
  path,
  author,
  datePublished,
  dateModified,
  section,
  wordCount,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  author: string;
  datePublished?: string;
  dateModified: string;
  section?: string;
  wordCount?: number;
  keywords?: string[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["Article", "TechArticle"],
        "@id": `${abs(path)}#article`,
        headline: title,
        description,
        url: abs(path),
        image: [siteConfig.ogImage],
        inLanguage: "en-IN",
        datePublished: datePublished ?? dateModified,
        dateModified,
        author: { "@type": "Person", name: author },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": WEBSITE_ID },
        mainEntityOfPage: abs(path),
        ...(section ? { articleSection: section } : {}),
        ...(wordCount ? { wordCount } : {}),
        ...(keywords && keywords.length ? { keywords: keywords.join(", ") } : {}),
      }}
    />
  );
}

/** Person schema — speakers, judges, authors. Reusable across the site. */
export function PersonJsonLd({
  name,
  jobTitle,
  description,
  sameAs,
  path,
}: {
  name: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
  path?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        ...(jobTitle ? { jobTitle } : {}),
        ...(description ? { description } : {}),
        worksFor: { "@id": ORG_ID },
        ...(path ? { url: abs(path) } : {}),
        ...(sameAs && sameAs.length ? { sameAs } : {}),
      }}
    />
  );
}

/** FAQPage schema — the canonical AEO format for AI answer extraction. */
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}

/** ItemList schema for listing pages — helps AI enumerate the full set. */
export function ItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: { name: string; href: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          url: abs(item.href),
        })),
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
          item: abs(item.href),
        })),
      }}
    />
  );
}
