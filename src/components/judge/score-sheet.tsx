"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import type { JudgeRound } from "@/lib/data/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TeamKey = "teamA" | "teamB";
type Scores = Record<string, number>;

function ScorePips({
  value,
  onChange,
  disabled,
  name,
}: {
  value: number | undefined;
  onChange: (n: number) => void;
  disabled?: boolean;
  name: string;
}) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value != null && n <= value;
        const exact = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={exact}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "press inline-flex h-10 w-10 items-center justify-center rounded-full font-mono text-[13px] font-medium transition-colors duration-150",
              active ? "bg-yellow text-ink-900" : "bg-white/8 text-ink-300 hover:bg-white/15 hover:text-canvas",
              disabled && "pointer-events-none opacity-80",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export function ScoreSheet({ round, readOnly = false }: { round: JudgeRound; readOnly?: boolean }) {
  const router = useRouter();
  const [active, setActive] = React.useState<TeamKey>("teamA");
  // Sheets always open blank; submitted scores will hydrate from the store
  // once adjudication persistence lands.
  const [scores, setScores] = React.useState<Record<TeamKey, Scores>>({ teamA: {}, teamB: {} });
  const [feedback, setFeedback] = React.useState<Record<TeamKey, string>>({ teamA: "", teamB: "" });
  const [submitting, setSubmitting] = React.useState(false);

  const teams: Record<TeamKey, JudgeRound["teamA"]> = { teamA: round.teamA, teamB: round.teamB };

  const teamTotal = (key: TeamKey) =>
    round.categories.reduce((sum, c) => sum + (scores[key][c.key] ?? 0), 0);

  const teamComplete = (key: TeamKey) =>
    round.categories.every((c) => scores[key][c.key] != null);

  const allComplete = teamComplete("teamA") && teamComplete("teamB");

  const setScore = (team: TeamKey, cat: string, n: number) =>
    setScores((prev) => ({ ...prev, [team]: { ...prev[team], [cat]: n } }));

  const onSubmit = async () => {
    if (!allComplete) {
      toast.error("Score every category for both teams first.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    toast.success("Evaluation submitted", {
      description: `${round.roundLabel} · scores published to participants.`,
    });
    router.push("/judge");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/judge"
        className="press inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 transition-colors hover:text-canvas"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Assigned rounds
      </Link>

      {/* Matchup header */}
      <div className="mt-5 rounded-feature panel-raised p-6 text-canvas sm:p-8">
        <div className="flex items-center justify-between">
          <Eyebrow>{round.eventTitle} · {round.room}</Eyebrow>
          {readOnly ? (
            <Badge variant="success" size="sm"><Check className="h-3 w-3" strokeWidth={3} /> Submitted</Badge>
          ) : (
            <Badge variant="ghostDark" size="sm">Scoring</Badge>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{round.roundLabel}</h1>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-rose-deep">“{round.motion}”</p>

        {/* Team switch */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-void/70 p-1 ring-1 ring-inset ring-white/10">
          {(["teamA", "teamB"] as TeamKey[]).map((key) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={cn(
                  "relative rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-ink-900" : "text-ink-300 hover:text-canvas",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="team-switch"
                    className="absolute inset-0 rounded-full bg-canvas"
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {teams[key].name}
                  {teamComplete(key) && (
                    <Check className={cn("h-3.5 w-3.5", isActive ? "text-success" : "text-teal")} strokeWidth={3} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scoring desk */}
      <div className="mt-5 rounded-feature panel p-6 sm:p-8">
        <div className="flex items-end justify-between border-b border-white/8 pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-canvas">{teams[active].name}</h2>
            <p className="text-sm text-ink-400">{teams[active].school}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-3xl font-semibold tabular leading-none text-canvas">
              {teamTotal(active)}
              <span className="text-base text-ink-400">/20</span>
            </div>
            <div className="eyebrow mt-1">running total</div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {round.categories.map((cat) => (
            <div key={cat.key} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-canvas">{cat.label}</p>
                <p className="text-[12px] text-ink-400">{cat.hint}</p>
              </div>
              <ScorePips
                name={`${teams[active].name} — ${cat.label}`}
                value={scores[active][cat.key]}
                onChange={(n) => setScore(active, cat.key, n)}
                disabled={readOnly}
              />
            </div>
          ))}
        </div>

        <div className="mt-7 border-t border-white/8 pt-6">
          <label htmlFor={`feedback-${active}`} className="text-sm font-semibold tracking-tight text-canvas">
            Written feedback
          </label>
          <p className="mb-3 mt-0.5 text-[12px] text-ink-400">
            Specific and actionable. This goes straight to {teams[active].name}.
          </p>
          <Textarea
            id={`feedback-${active}`}
            rows={4}
            disabled={readOnly}
            value={feedback[active]}
            onChange={(e) => setFeedback((prev) => ({ ...prev, [active]: e.target.value }))}
            placeholder="Write your feedback here…"
          />
        </div>
      </div>

      {/* Submit bar */}
      {!readOnly && (
        <div className="glass-dark sticky bottom-4 mt-5 flex items-center justify-between gap-4 rounded-full px-5 py-3 text-canvas">
          <div className="flex items-center gap-3 text-sm">
            <span className={cn("signal-lamp", allComplete ? "bg-success" : "bg-warning")} />
            <span className="text-ink-300">
              {allComplete ? "Ready to submit" : `${[teamComplete("teamA"), teamComplete("teamB")].filter(Boolean).length}/2 teams scored`}
            </span>
          </div>
          <Button
            type="button"
            variant="yellow"
            size="md"
            disabled={submitting}
            onClick={onSubmit}
            className="group"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                Submitting
              </>
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={1.75} />
                Submit evaluation
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
