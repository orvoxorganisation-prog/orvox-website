import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { getJudgeProfile } from "@/lib/repo";

export const metadata: Metadata = { title: "Feedback history", robots: { index: false } };

/** Written feedback the judge has filed. Populates as sheets are submitted. */
const filed: { round: string; team: string; text: string }[] = [];

export default async function FeedbackHistoryPage() {
  const judge = await getJudgeProfile();

  return (
    <div className="mx-auto max-w-3xl">
      <DashHeader
        title="Feedback history"
        description="Everything you've written back to competitors. Specific notes travel."
      />

      {filed.length === 0 && (
        <div className="rounded-feature border border-dashed border-white/12 bg-white/[0.02] p-8">
          <p className="text-lg font-semibold tracking-tight text-canvas">Nothing filed yet.</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-400">
            The written feedback you submit with each score sheet is collected
            here. Specific notes travel further than numbers.
          </p>
        </div>
      )}
      <ul className="space-y-4">
        {filed.map((f, i) => (
          <li key={i} className="rounded-card panel p-6">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-rose-deep" strokeWidth={1.75} />
              <p className="text-sm font-semibold tracking-tight text-canvas">{f.team}</p>
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">· {f.round}</span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-300">{f.text}</p>
            <p className="mt-3 text-[12px] text-ink-400">by {judge.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
