import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageSquareQuote, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import { StandingsTable } from "@/components/results/standings-table";
import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getResultBySlug, getResultSets, getEventBySlug } from "@/lib/repo";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const results = await getResultSets();
  return Array.from(new Set(results.map((r) => r.eventSlug))).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getResultBySlug(slug);
  if (!result) return {};
  const url = `/results/${slug}`;
  const description = `${result.roundLabel}: standings and adjudicator feedback for ${result.eventTitle}. Motion: ${result.motion}`;
  return {
    title: `${result.eventTitle} — Results`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${result.eventTitle} — Results`,
      description,
      modifiedTime: result.decidedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${result.eventTitle} — Results`,
      description,
    },
  };
}

export default async function ResultDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getResultBySlug(slug);
  if (!result) notFound();

  const event = await getEventBySlug(slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Results", href: "/results" },
          { name: result.eventTitle, href: `/results/${slug}` },
        ]}
      />

      <div className="spotlight pt-24 pb-12 text-canvas sm:pt-28">
        <Container>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-400">
            <Link href="/results" className="transition-colors hover:text-canvas">Results</Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-500" strokeWidth={2} />
            <span className="truncate text-ink-200">{result.eventTitle}</span>
          </nav>

          <div className="mt-8 flex flex-col gap-6 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow items={[result.season, result.roundLabel, formatDate(result.decidedAt)]} />
              <h1 className="display-1 mt-5 text-canvas">
                {result.eventTitle} <em className="text-yellow">decided.</em>
              </h1>
              <p className="mt-5 font-serif text-xl italic leading-relaxed text-ink-300">
                “{result.motion}”
              </p>
            </div>
            {event && (
              <Link href={`/events/${event.slug}`} className={buttonVariants({ variant: "ghost", size: "md" })}>
                Event page
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            )}
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_340px]">
            <section aria-label="Standings">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Standings</h2>
              <Reveal y={26} className="mt-4">
                <StandingsTable standings={result.standings} />
              </Reveal>
            </section>

            {/* The human voice: rose editorial blocks */}
            <section aria-label="Judge feedback">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Judge feedback</h2>
              <Reveal stagger={0.1} className="mt-4 space-y-4">
                {result.judgeNotes.map((note, i) => (
                  <div key={i} data-reveal className="rounded-card panel p-5">
                    <div className="flex items-center gap-2">
                      <MessageSquareQuote className="h-4 w-4 text-rose-deep" strokeWidth={1.75} />
                      <p className="text-sm font-semibold tracking-tight text-canvas">{note.by}</p>
                    </div>
                    <p className="mt-0.5 text-[12px] text-ink-400">{note.role}</p>
                    <ul className="mt-3 space-y-2">
                      {note.points.map((point, j) => (
                        <li key={j} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-300">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-deep/60" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Reveal>
            </section>
          </div>
        </Container>
      </div>
    </>
  );
}
