import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { scoreCategories } from "@/lib/data/judge";
import { cn } from "@/lib/utils";

const demoScores: Record<string, number> = { content: 5, style: 4, strategy: 5, impact: 4 };

export function JudgesBand() {
  return (
    <section className="relative overflow-hidden bg-void text-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-16 h-[26rem] w-[26rem] rounded-full bg-teal opacity-[0.08] blur-[110px]"
      />
      <Section className="relative">
        <Container className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <p data-reveal className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-400">Adjudication</p>
            <h2 data-reveal className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl">
              Scored live. <em className="text-teal">Judged</em> for real.
            </h2>
            <p data-reveal className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-400">
              Every speaker is marked on the same four-band rubric. Scores publish
              within minutes and every round comes with written feedback from the
              panel that judged you. No black box, no committee.
            </p>
            <Link
              href="/judge"
              data-reveal
              className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-canvas py-2 pl-5 pr-2 text-sm font-semibold text-stage active:scale-[0.97]"
            >
              How judging works
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
          </Reveal>

          {/* Double-bezel scorecard */}
          <Reveal>
            <div data-reveal className="overflow-hidden rounded-feature border border-white/10 bg-white/[0.02]">
              <div className="p-7 sm:p-8">
                <div className="flex items-center justify-between border-b border-white/8 pb-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">How a sheet looks</p>
                    <p className="mt-2 font-semibold tracking-tight">
                      Proposition <span className="text-ink-500">vs</span> Opposition
                    </p>
                  </div>
                  <span className="font-mono text-3xl font-semibold tabular text-teal">89</span>
                </div>

                <div className="mt-6 space-y-5">
                  {scoreCategories.map((cat) => (
                    <div key={cat.key} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-canvas">{cat.label}</p>
                        <p className="truncate text-[11px] text-ink-400">{cat.hint}</p>
                      </div>
                      <div className="flex shrink-0 gap-1.5" aria-hidden>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px]",
                              n <= demoScores[cat.key] ? "bg-teal text-stage" : "bg-white/[0.06] text-ink-500",
                            )}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-card bg-white/[0.04] p-4 ring-1 ring-inset ring-white/8">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                    <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} /> Feedback submitted
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-200">
                    “Strong arguments and well-structured points. Excellent use of
                    evidence. Work on rebuttal clarity.”
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </section>
  );
}
