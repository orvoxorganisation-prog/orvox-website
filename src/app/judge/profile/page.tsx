import type { Metadata } from "next";
import { BadgeCheck, Gavel, Star } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { Avatar } from "@/components/ui/avatar";
import { Reveal } from "@/components/motion/reveal";
import { getJudgeProfile } from "@/lib/repo";

export const metadata: Metadata = { title: "Judge profile", robots: { index: false } };

export default async function JudgeProfilePage() {
  const judge = await getJudgeProfile();

  const stats = [
    { Icon: Gavel, value: String(judge.roundsJudged).padStart(2, "0"), label: "Rounds judged" },
    { Icon: Star, value: "·", label: "Competitor rating" },
    { Icon: BadgeCheck, value: "Panel", label: "Accreditation" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <DashHeader title="Profile" />

      <Reveal y={24} className="overflow-hidden rounded-feature panel-raised">
        <div className="relative isolate flex items-center gap-5 overflow-hidden p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-teal opacity-15 blur-[70px]"
          />
          <Avatar name={judge.name} accent="teal" size={72} />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-canvas">{judge.name}</h2>
            <p className="font-mono text-sm text-ink-400">{judge.handle}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-teal">
              <BadgeCheck className="h-4 w-4" strokeWidth={2} /> {judge.accreditation}
            </p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-white/8 bg-white/[0.02] p-7 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-ink-300">
                <s.Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-mono text-xl font-semibold tabular leading-none text-canvas">{s.value}</div>
                <div className="mt-1 text-[12px] text-ink-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <p className="mt-6 text-sm leading-relaxed text-ink-400">
        You adjudicate on the ORVOX four-band rubric: content, style, strategy, and overall
        impact. Calibrate with your panel before round one, and keep written feedback specific.
        It's the part competitors remember.
      </p>
    </div>
  );
}
