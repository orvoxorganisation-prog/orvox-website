import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getEvents, getResources, getResultSets } from "@/lib/repo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [events, resources, results] = await Promise.all([
    getEvents(),
    getResources(),
    getResultSets(),
  ]);

  const staticRoutes = ["", "/events", "/resources", "/results", "/about", "/contact", "/login", "/signup"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const eventRoutes = events.map((e) => ({
    url: `${base}/events/${e.slug}`,
    lastModified: new Date(e.registrationDeadline),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const resourceRoutes = resources.map((r) => ({
    url: `${base}/resources/${r.slug}`,
    lastModified: new Date(r.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const resultRoutes = results.map((r) => ({
    url: `${base}/results/${r.eventSlug}`,
    lastModified: new Date(r.decidedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...eventRoutes, ...resourceRoutes, ...resultRoutes];
}
