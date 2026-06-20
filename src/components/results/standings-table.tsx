import { Trophy } from "lucide-react";
import type { Standing } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: Standing["status"] }) {
  if (status === "champion")
    return (
      <span className="inline-flex h-6 items-center rounded-full bg-ink-900 px-2.5 text-[11px] font-medium leading-none text-yellow">
        Champion
      </span>
    );
  if (status === "advanced") return <Badge variant="success" size="sm">Advanced</Badge>;
  return <Badge variant="muted" size="sm">Eliminated</Badge>;
}

/**
 * The podium board. Champion row is the page's single drenched moment:
 * full yellow with the winner glow. Everyone else sits on the dark ledger.
 */
export function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-hidden rounded-feature panel">
      {/* Header */}
      <div className="hidden grid-cols-[3rem_1fr_8rem_5rem] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3 sm:grid">
        <span className="eyebrow">Rank</span>
        <span className="eyebrow">Participant / Team</span>
        <span className="eyebrow text-right sm:text-left">Status</span>
        <span className="eyebrow text-right">Score</span>
      </div>

      <ul className="divide-y divide-white/8">
        {standings.map((s) => {
          const champ = s.status === "champion";
          return (
            <li
              key={s.rank}
              className={cn(
                "grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[3rem_1fr_8rem_5rem]",
                champ && "bg-yellow text-ink-900 shadow-[var(--shadow-glow-winner)]",
              )}
            >
              <div className="flex items-center">
                {champ ? (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-yellow">
                    <Trophy className="h-4 w-4" strokeWidth={2} />
                  </span>
                ) : (
                  <span className="font-mono text-lg font-semibold tabular text-ink-400">
                    {s.rank}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className={cn("truncate font-semibold tracking-tight", champ ? "text-ink-900" : "text-canvas")}>
                  {s.team}
                </p>
                <p className={cn("truncate text-[13px]", champ ? "text-ink-900/65" : "text-ink-400")}>
                  {s.members.join(" · ")} · {s.school}
                </p>
                <div className="mt-2 sm:hidden">
                  <StatusBadge status={s.status} />
                </div>
              </div>

              <div className="hidden sm:block">
                <StatusBadge status={s.status} />
              </div>

              <div className="text-right">
                <span
                  className={cn(
                    "font-mono text-xl font-semibold tabular [font-feature-settings:'tnum','zero']",
                    champ ? "text-ink-900" : "text-canvas",
                  )}
                >
                  {s.score}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
