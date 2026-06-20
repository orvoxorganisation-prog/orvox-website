import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { getJudgeProfile } from "@/lib/repo";
import { formatTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Evaluations", robots: { index: false } };

const statusBadge = {
  assigned: <Badge variant="ghost" size="sm">Assigned</Badge>,
  scoring: <Badge variant="warning" size="sm">In progress</Badge>,
  submitted: <Badge variant="success" size="sm">Submitted</Badge>,
};

export default async function EvaluationsPage() {
  const judge = await getJudgeProfile();

  return (
    <div className="mx-auto max-w-4xl">
      <DashHeader
        title="Evaluations"
        description={`${judge.roundsJudged} rounds judged across the season.`}
      />

      {judge.rounds.length === 0 && (
        <div className="rounded-feature border border-dashed border-white/12 bg-white/[0.02] p-8">
          <p className="text-lg font-semibold tracking-tight text-canvas">No evaluations yet.</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-400">
            Every sheet you score this season is archived here with its status.
          </p>
        </div>
      )}
      {judge.rounds.length > 0 && (
      <Reveal y={24} className="overflow-hidden rounded-card panel">
        <div className="hidden grid-cols-[1fr_1fr_8rem_3rem] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3 sm:grid">
          <span className="eyebrow">Round</span>
          <span className="eyebrow">Teams</span>
          <span className="eyebrow">Status</span>
          <span className="eyebrow text-right">Open</span>
        </div>
        <ul className="divide-y divide-white/8">
          {judge.rounds.map((round) => (
            <li key={round.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1fr_1fr_8rem_3rem]">
              <div className="min-w-0">
                <p className="truncate font-semibold tracking-tight text-canvas">{round.roundLabel}</p>
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
                  {formatTime(round.startsAt)}
                </p>
              </div>
              <p className="hidden truncate text-sm text-ink-300 sm:block">
                {round.teamA.name} vs {round.teamB.name}
              </p>
              <div className="hidden sm:block">{statusBadge[round.status]}</div>
              <Link
                href={`/judge/evaluate/${round.id}`}
                className="justify-self-end text-ink-400 transition-colors hover:text-canvas"
                aria-label={`Open ${round.roundLabel}`}
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
      )}
    </div>
  );
}
