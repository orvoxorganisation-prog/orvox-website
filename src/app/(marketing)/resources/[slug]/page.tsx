import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Calendar, ArrowUpRight, BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ResourceCard } from "@/components/resources/resource-card";
import { ReadProgress } from "@/components/motion/read-progress";
import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getResources } from "@/lib/repo";
import { trackLabel } from "@/lib/accent";
import { formatDate } from "@/lib/utils";
import type { ResourceType } from "@/lib/data/types";

const typeFraming: Record<ResourceType, { tag: string; note: string }> = {
  guide: { tag: "Guide", note: "Read it once before the round, skim it after. It assumes you've competed before, not that you're an expert." },
  drill: { tag: "Drill", note: "Run it on a timer until the structure is muscle. Five focused minutes beats an hour of drifting." },
  template: { tag: "Template", note: "Copy it, fill it, bring it into the room. The frame does the remembering so you can do the thinking." },
  video: { tag: "Video", note: "Watch it once at full speed, then again at the parts that matter." },
  reference: { tag: "Reference", note: "Keep it open in another tab. It's built to be searched, not read end to end." },
};

export async function generateStaticParams() {
  const resources = await getResources();
  return resources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resources = await getResources();
  const resource = resources.find((r) => r.slug === slug);
  if (!resource) return {};
  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: `/resources/${slug}` },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resources = await getResources();
  const resource = resources.find((r) => r.slug === slug);
  if (!resource) notFound();

  const framing = typeFraming[resource.type];
  const related = resources
    .filter((r) => r.id !== resource.id && r.track === resource.track)
    .slice(0, 3);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Resources", href: "/resources" },
          { name: resource.title, href: `/resources/${slug}` },
        ]}
      />

      <ReadProgress target="article" />

      <article className="spotlight pt-24 text-canvas sm:pt-28">
        <Container className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-400">
            <Link href="/resources" className="transition-colors hover:text-canvas">Resources</Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-500" strokeWidth={2} />
            <span className="truncate text-ink-200">{resource.title}</span>
          </nav>

          <header className="mt-8">
            <div className="flex items-center gap-2">
              <Badge variant="muted" size="sm">{framing.tag}</Badge>
              <Badge variant="ghost" size="sm">{trackLabel[resource.track]}</Badge>
            </div>
            <h1 className="display-2 mt-6 text-canvas">{resource.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-400">
              <span className="font-medium text-ink-200">{resource.author}</span>
              <span className="inline-flex items-center gap-1.5 font-mono tabular">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                {resource.minutes} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                Updated {formatDate(resource.updatedAt)}
              </span>
            </div>
          </header>

          <div className="mt-12 space-y-7">
            <p className="font-serif text-2xl italic leading-relaxed text-rose-deep">
              {resource.description}
            </p>

            <div className="flex gap-4 rounded-card panel p-5">
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-teal" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-semibold tracking-tight text-canvas">How to use it</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-300">{framing.note}</p>
              </div>
            </div>

            <p className="text-[15.5px] leading-relaxed text-ink-300">
              This piece is part of the ORVOX library: the same material our coaches and chairs
              hand to competitors before a season. Save it to your dashboard to keep it close on
              competition day, and pair it with the events it was written for.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/dashboard/resources" className={buttonVariants({ variant: "primary", size: "md" })}>
                Save to dashboard
              </Link>
              <Link
                href={`/events?track=${resource.track}`}
                className={buttonVariants({ variant: "ghost", size: "md" })}
              >
                {trackLabel[resource.track]} events
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </Container>

        {related.length > 0 && (
          <Container className="mt-16 border-t border-white/8 py-14">
            <Eyebrow>More {trackLabel[resource.track].toLowerCase()}</Eyebrow>
            <Reveal stagger={0.08} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <div key={r.id} data-reveal>
                  <ResourceCard resource={r} className="h-full" />
                </div>
              ))}
            </Reveal>
          </Container>
        )}
      </article>
    </>
  );
}
