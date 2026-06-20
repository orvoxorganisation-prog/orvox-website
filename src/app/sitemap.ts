import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getEvents, getResources, getResultSets } from "@/lib/repo";

/**
 * XML sitemap — public, canonical, indexable URLs only. Auth/private routes are
 * intentionally excluded (they're disallowed in robots.txt). Event entries
 * carry an image so they're eligible for image search + rich event listings.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [events, resources, results] = await Promise.all([
    getEvents(),
    getResources(),
    getResultSets(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/events", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/results", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/resources", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${base}/events/${e.slug}`,
    lastModified: new Date(e.registrationDeadline),
    changeFrequency: "weekly",
    priority: 0.8,
    images: [siteConfig.ogImage],
  }));

  const resourceRoutes: MetadataRoute.Sitemap = resources.map((r) => ({
    url: `${base}/resources/${r.slug}`,
    lastModified: new Date(r.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const resultRoutes: MetadataRoute.Sitemap = results.map((r) => ({
    url: `${base}/results/${r.eventSlug}`,
    lastModified: new Date(r.decidedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...eventRoutes, ...resourceRoutes, ...resultRoutes];
}
