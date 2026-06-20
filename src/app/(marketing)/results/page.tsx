import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/motion/reveal";
import { WebPageJsonLd, ItemListJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getResultSets } from "@/lib/repo";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Results",
  description:
    "Published standings and adjudicator feedback from ORVOX rooms. Scores go up within minutes of each round closing.",
  alternates: { canonical: "/results" },
};

/** The season ledger: every decided room, champion named in yellow. */
export default async function ResultsPage() {
  const results = await getResultSets();

  return (
    <>
      <WebPageJsonLd
        path="/results"
        title="ORVOX Results — standings & adjudicator feedback"
        description="Published standings and adjudicator feedback from ORVOX competition rooms."
        type="CollectionPage"
        breadcrumb={[{ name: "Results", href: "/results" }]}
      />
      {results.length > 0 && (
        <ItemListJsonLd
          name="ORVOX results"
          items={results.map((r) => ({ name: r.eventTitle, href: `/results/${r.eventSlug}` }))}
        />
      )}
      <BreadcrumbJsonLd items={[{ name: "Results", href: "/results" }]} />
      <PageHeader
        eyebrow="published · scored live"
        tint="yellow"
        title={
          <>
            The <em className="text-yellow">record.</em>
          </>
        }
        description="Standings and panel feedback from every room, the moment the round closes. No black box, no delay."
      />
      <Container className="py-12 text-canvas sm:py-16">
        {results.length === 0 && (
          <div className="rounded-feature border border-dashed border-white/12 bg-white/[0.02] p-10 sm:p-14">
            <p className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">
              <span className="signal-lamp bg-warning" aria-hidden />
              Season three · no rooms decided yet
            </p>
            <h2 className="mt-5 max-w-xl text-3xl font-bold tracking-tight text-canvas">
              The record starts when the first room closes.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-300">
              Standings and panel feedback publish here within minutes of each
              round. Until then, the slate is open.
            </p>
            <Link
              href="/events"
              className="press mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-yellow px-6 text-sm font-semibold text-ink-900"
            >
              Browse events
            </Link>
          </div>
        )}
        {results.length > 0 && (
        <Reveal className="border-t border-white/8" stagger={0.06}>
          {results.map((r) => {
            const champ = r.standings.find((s) => s.status === "champion") ?? r.standings[0];
            return (
              <Link
                key={`${r.eventSlug}-${r.roundLabel}`}
                href={`/results/${r.eventSlug}`}
                data-reveal
                className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-b border-white/8 py-7 transition-colors duration-300 hover:bg-white/[0.025] sm:grid-cols-[8.5rem_1fr_minmax(12rem,16rem)_auto] sm:gap-8"
              >
                <span className="hidden font-mono text-[13px] tabular leading-snug text-ink-400 sm:block">
                  {formatDate(r.decidedAt)}
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-ink-500">
                    {r.roundLabel}
                  </span>
                </span>

                <div className="min-w-0">
                  <h3 className="text-xl font-bold tracking-tight text-canvas transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                    {r.eventTitle}
                  </h3>
                  <p className="mt-1.5 line-clamp-1 font-serif text-[15px] italic text-ink-400">
                    “{r.motion}”
                  </p>
                  <p className="mt-2 font-mono text-[12px] tabular text-ink-400 sm:hidden">
                    {formatDate(r.decidedAt)} · {r.roundLabel}
                  </p>
                </div>

                <div className="hidden items-center gap-2.5 sm:flex">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow text-ink-900">
                    <Trophy className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <span className="truncate text-sm font-semibold text-yellow">{champ.team}</span>
                </div>

                <span className="col-start-2 row-start-1 flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset ring-white/12 transition-colors duration-300 group-hover:bg-canvas group-hover:text-ink-900 sm:col-start-4">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </Link>
            );
          })}
        </Reveal>
        )}
      </Container>
    </>
  );
}
