import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Check } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { getJudgeProfile } from "@/lib/repo";
import { cn, formatTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Assigned rounds", robots: { index: false } };

/** The booth rundown: next room elevated, the rest queued beneath it. */
export default async function JudgeRoundsPage() {
  const judge = await getJudgeProfile();
  const toScore = judge.rounds.filter((r) => r.status !== "submitted");
  const done = judge.rounds.filter((r) => r.status === "submitted");
  const [next, ...queue] = toScore;

  return (
    <div className="mx-auto max-w-4xl">
      <DashHeader
        title={`Welcome, ${judge.name.split(" ")[0]}.`}
        description="Your rooms for today. Score them in order; motions are already released."
      />

      <section aria-label="To score">
        <Eyebrow live={Boolean(next)}>To score · {toScore.length}</Eyebrow>

        {toScore.length === 0 && done.length === 0 && (
          <div className="mt-4 rounded-feature border border-dashed border-white/12 bg-white/[0.02] p-8">
            <p className="text-lg font-semibold tracking-tight text-canvas">No rooms assigned yet.</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-400">
              When an organiser pairs you to a round, it lands here with the
              motion, the matchup, and a score sheet ready to open.
            </p>
          </div>
        )}

        {/* The room you're due in next */}
        {next && (
          <Reveal y={24} className="relative isolate mt-4 overflow-hidden rounded-feature panel-raised p-6 ring-1 ring-inset ring-yellow/20 sm:p-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-yellow opacity-15 blur-[80px]"
            />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-yellow">
                  <span className="signal-lamp bg-yellow" aria-hidden />
                  Up next · {formatTime(next.startsAt)}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-canvas">
                  {next.teamA.name} <span className="text-ink-400">vs</span> {next.teamB.name}
                </h3>
                <p className="mt-2 line-clamp-2 font-serif text-[15px] italic text-rose-deep">
                  “{next.motion}”
                </p>
                <p className="mt-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-400">
                  {next.roundLabel} · {next.eventTitle}
                </p>
              </div>
              <Link
                href={`/judge/evaluate/${next.id}`}
                className={cn(buttonVariants({ variant: "yellow", size: "md" }), "group shrink-0 self-start sm:self-center")}
              >
                {next.status === "scoring" ? "Continue scoring" : "Open score sheet"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </Link>
            </div>
          </Reveal>
        )}

        {/* The queue */}
        {queue.length > 0 && (
          <Reveal as="ul" stagger={0.06} className="mt-4 overflow-hidden rounded-feature panel">
            {queue.map((round, i) => (
              <li key={round.id} data-reveal className={cn(i > 0 && "border-t border-white/8")}>
                <div className="flex flex-col gap-4 p-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-semibold tracking-tight text-canvas">{round.roundLabel}</h3>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-500" aria-hidden />
                        {round.status === "scoring" ? "In progress" : "Assigned"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-300">
                      {round.teamA.name} <span className="text-ink-500">vs</span> {round.teamB.name}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-400">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> {round.eventTitle} · {formatTime(round.startsAt)}
                    </p>
                  </div>
                  <Link
                    href={`/judge/evaluate/${round.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "group shrink-0 self-start sm:self-auto")}
                  >
                    {round.status === "scoring" ? "Continue" : "Score"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                  </Link>
                </div>
              </li>
            ))}
          </Reveal>
        )}
      </section>

      {done.length > 0 && (
        <section aria-label="Submitted" className="mt-10">
          <Eyebrow>Submitted · {done.length}</Eyebrow>
          <ul className="mt-4 border-t border-white/8">
            {done.map((round) => (
              <li
                key={round.id}
                className="flex items-center justify-between gap-4 border-b border-white/8 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-semibold tracking-tight text-ink-300">{round.roundLabel}</h3>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-success">
                      <Check className="h-3 w-3" strokeWidth={3} /> Submitted
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-400">
                    {round.teamA.name} vs {round.teamB.name}
                  </p>
                </div>
                <Link
                  href={`/judge/evaluate/${round.id}`}
                  className="text-sm font-medium text-ink-400 underline-offset-4 transition-colors hover:text-canvas hover:underline"
                >
                  View sheet
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
