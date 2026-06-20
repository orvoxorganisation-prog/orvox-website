import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { Reveal } from "@/components/motion/reveal";
import { requireAccount, getResultSets } from "@/lib/repo";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Results", robots: { index: false } };

export default async function DashboardResultsPage() {
  const [account, allResults] = await Promise.all([requireAccount(), getResultSets()]);
  const registeredSlugs = new Set(account.registrations.map((r) => r.eventSlug));
  const myResults = allResults.filter((r) => registeredSlugs.has(r.eventSlug));

  const tape = [
    { value: String(account.stats.rounds).padStart(2, "0"), label: "Rounds spoken" },
    { value: account.stats.bestRank ? `#${account.stats.bestRank}` : "·", label: "Best rank" },
    { value: account.stats.speakerAvg ? String(account.stats.speakerAvg) : "·", label: "Speaker average" },
    { value: String(account.stats.events).padStart(2, "0"), label: "Events" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <DashHeader title="Results" description="Standings and feedback from the rooms you competed in." />

      {/* Speaker tape — one board, not four cards */}
      <Reveal stagger={0.07} className="grid grid-cols-2 divide-white/8 overflow-hidden rounded-feature panel sm:grid-cols-4 sm:divide-x">
        {tape.map((s, i) => (
          <div key={s.label} data-reveal className={i > 1 ? "border-t border-white/8 p-6 sm:border-t-0" : "p-6"}>
            <div className="font-mono text-3xl font-semibold tabular leading-none text-canvas">{s.value}</div>
            <div className="eyebrow mt-2.5">{s.label}</div>
          </div>
        ))}
      </Reveal>

      <section aria-label="Published results" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Published</h2>
        {myResults.length === 0 && (
          <div className="mt-4 rounded-feature border border-dashed border-white/12 bg-white/[0.02] p-8">
            <p className="text-lg font-semibold tracking-tight text-canvas">Nothing decided yet.</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-400">
              Standings from your rooms publish here within minutes of each
              round closing. Compete first, then watch this space.
            </p>
          </div>
        )}
        <Reveal as="ul" stagger={0.06} className="mt-4 border-t border-white/8">
          {myResults.map((r) => {
            const champ = r.standings.find((s) => s.status === "champion") ?? r.standings[0];
            return (
              <li key={`${r.eventSlug}-${r.roundLabel}`} data-reveal>
                <Link
                  href={`/results/${r.eventSlug}`}
                  className="group flex items-center justify-between gap-4 border-b border-white/8 py-5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight text-canvas">{r.eventTitle}</h3>
                    <p className="mt-0.5 font-mono text-[12px] uppercase tracking-wide text-ink-400">
                      {r.roundLabel} · {formatDate(r.decidedAt)}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-300">
                      <Trophy className="h-3.5 w-3.5 text-yellow" strokeWidth={2} />
                      <span className="font-medium text-yellow">{champ.team}</span> took it
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-canvas" strokeWidth={1.75} />
                </Link>
              </li>
            );
          })}
        </Reveal>
      </section>
    </div>
  );
}
