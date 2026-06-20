import type { Metadata } from "next";
import { Trophy, Lock, Mic, Award, PenLine } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { Reveal } from "@/components/motion/reveal";
import { requireAccount } from "@/lib/repo";
import { darkAccentOf } from "@/lib/accent";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Achievements", robots: { index: false } };

const iconFor: Record<string, typeof Trophy> = {
  ach_first: Mic,
  ach_quarter: Trophy,
  ach_speaker: Award,
  ach_byline: PenLine,
  ach_finalist: Trophy,
  ach_champion: Trophy,
};

/**
 * The trophy shelf: earned plaques are lit glass; locked ones are dim
 * sockets. Two visibly different materials on one shelf.
 */
export default async function AchievementsPage() {
  const account = await requireAccount();
  const earned = account.achievements.filter((a) => a.earned).length;

  return (
    <div className="mx-auto max-w-4xl">
      <DashHeader
        title="Achievements"
        description={
          earned > 0
            ? `${earned} of ${account.achievements.length} unlocked. Keep arguing.`
            : `Six plaques to earn this season. Lock a seat to light the first one.`
        }
      />

      <Reveal stagger={0.07} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {account.achievements.map((a) => {
          const accent = darkAccentOf(a.accent);
          const Icon = iconFor[a.id] ?? Award;

          if (!a.earned) {
            return (
              <div
                key={a.id}
                data-reveal
                className="rounded-card border border-dashed border-white/10 bg-white/[0.015] p-6"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-ink-500 ring-1 ring-inset ring-white/8">
                  <Lock className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink-400">{a.title}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-400/80">{a.detail}</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-ink-400">Locked</p>
              </div>
            );
          }

          return (
            <div
              key={a.id}
              data-reveal
              className={cn(
                "group lift rounded-card panel-raised p-6",
                a.accent === "yellow" && "shadow-[var(--shadow-glow-winner)]",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-full",
                  accent.solid,
                )}
              >
                <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-canvas">{a.title}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-300">{a.detail}</p>
              {a.date && (
                <p className="mt-3 font-mono text-[11px] tabular text-ink-400">{formatDate(a.date)}</p>
              )}
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}
