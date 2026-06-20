"use client";

import Link from "next/link";
import * as React from "react";
import { useRef } from "react";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/container";
import { Magnetic } from "@/components/motion/magnetic";
import { WordReveal } from "@/components/motion/word-reveal";
import { cn } from "@/lib/utils";
import type { OrvoxEvent } from "@/lib/data/types";

const rubric = [
  { label: "Content", a: 5, b: 4 },
  { label: "Style", a: 4, b: 5 },
  { label: "Strategy", a: 5, b: 4 },
  { label: "Impact", a: 4, b: 4 },
];

export function Hero({
  events,
  tape = [],
}: {
  events: OrvoxEvent[];
  /** Season facts computed from the slate (cities, seats, prize pool). */
  tape?: { value: string; label: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const flagship = events[0];

  // The panel is "marking" one rubric band at a time — the board stays alive.
  const [markRow, setMarkRow] = React.useState(-1);
  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setMarkRow((r) => (r + 1) % rubric.length), 3200);
    return () => clearInterval(id);
  }, [reduce]);

  useGSAP(
    () => {
      if (reduce || !ref.current) return;
      gsap.from(ref.current.querySelectorAll("[data-fade]"), {
        opacity: 0, y: 20, duration: 0.85, ease: "expo.out", stagger: 0.09, delay: 0.4,
      });
      gsap.from(ref.current.querySelector("[data-board]"), {
        opacity: 0, y: 36, duration: 1, ease: "expo.out", delay: 0.55,
      });

      // Depth on exit: the studio grid sinks while the board floats.
      gsap.to(ref.current.querySelector("[data-grid]"), {
        yPercent: 16,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.5 },
      });
      gsap.to(ref.current.querySelector("[data-board]"), {
        y: -48,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.5 },
      });
    },
    { scope: ref, dependencies: [reduce] },
  );

  return (
    <section
      ref={ref}
      data-stage
      className="relative isolate overflow-hidden bg-stage text-canvas"
    >
      {/* broadcast studio grid — structure, not glow */}
      <div
        aria-hidden
        data-grid
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(120% 90% at 30% 20%, black 30%, transparent 80%)",
        }}
      />

      <Container className="relative grid min-h-[100svh] items-center gap-14 pt-32 pb-20 lg:grid-cols-[1.08fr_0.92fr] lg:pt-28">
        {/* Left — editorial */}
        <div>
          <div data-fade className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-3.5 py-1.5">
            <span className="motion-safe-only h-1.5 w-1.5 rounded-full bg-live" style={{ animation: "var(--animate-live-pulse)" }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-200">
              S03 · applications open
            </span>
          </div>

          <WordReveal
            as="h1"
            className="mt-7 font-bold leading-[0.9] tracking-[-0.045em] text-canvas"
            stagger={0.05}
          >
            <span className="block text-[clamp(3.25rem,9vw,7rem)]">
              Argue <em className="text-yellow">better.</em>
            </span>
            <span className="block text-[clamp(3.25rem,9vw,7rem)]">
              Win <em className="text-teal">louder.</em>
            </span>
          </WordReveal>

          <p data-fade className="mt-8 max-w-md text-lg leading-relaxed text-ink-300">
            The youth forum for debate and public speaking. Real rounds, live
            scores, and feedback from the panel that judged you.
          </p>

          <div data-fade className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.4}>
              <Link
                href="/signup"
                className="group flex items-center gap-2.5 rounded-full bg-canvas py-2 pl-6 pr-2 text-[15px] font-semibold text-stage transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
              >
                Get your seat
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </Link>
            </Magnetic>
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium text-ink-200 ring-1 ring-inset ring-white/12 transition-colors hover:bg-white/5 hover:text-canvas"
            >
              Browse events
              <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>

          {/* tale of the tape — computed from the season slate */}
          {tape.length > 0 && (
            <div data-fade className="mt-12 flex items-center gap-6 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              {tape.map((s, i) => (
                <span key={s.label} className="flex items-center gap-6">
                  {i > 0 && <span className="h-3 w-px bg-white/15" />}
                  <span>
                    <span className="text-canvas">{s.value}</span> {s.label}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right — live broadcast scoreboard (the product, as the hero asset) */}
        <div data-board className="relative">
          <div className="overflow-hidden rounded-[28px] bg-yellow text-ink-900 shadow-[0_40px_120px_-50px_rgba(255,208,47,0.5)]">
            {/* board header */}
            <div className="flex items-center justify-between border-b border-ink-900/15 px-6 py-4">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">
                <span className="motion-safe-only h-2 w-2 rounded-full bg-danger" style={{ animation: "var(--animate-live-pulse)" }} />
                Live · Round 2
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-900/60">
                {flagship ? flagship.title : "Debate Championship"}
              </span>
            </div>

            {/* teams + scores — generic bench positions, not real people */}
            <div className="divide-y divide-ink-900/12">
              {[
                { team: "Proposition", school: "Opening Government", score: 89, lead: true },
                { team: "Opposition", school: "Opening Opposition", score: 86, lead: false },
              ].map((t) => (
                <div key={t.team} className="flex items-center justify-between gap-4 px-6 py-5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-lg font-bold tracking-tight">
                      {t.team}
                      {t.lead && <span className="rounded-full bg-ink-900 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-yellow">Lead</span>}
                    </p>
                    <p className="truncate text-[12px] text-ink-900/55">{t.school}</p>
                  </div>
                  <span className="font-mono text-4xl font-semibold tabular leading-none">{t.score}</span>
                </div>
              ))}
            </div>

            {/* rubric bars */}
            <div className="border-t border-ink-900/15 bg-ink-900 px-6 py-5 text-canvas">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">Adjudication · four-band rubric</p>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                {rubric.map((r, i) => {
                  const marking = markRow === i;
                  return (
                    <div
                      key={r.label}
                      className={cn(
                        "flex items-center justify-between gap-3 transition-opacity duration-500",
                        markRow >= 0 && !marking && "opacity-55",
                      )}
                    >
                      <span className={cn("text-[12px] transition-colors duration-500", marking ? "text-yellow" : "text-ink-300")}>
                        {r.label}
                      </span>
                      <span className="flex gap-1" aria-hidden>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} className={n <= r.a ? "h-3.5 w-1.5 rounded-full bg-yellow" : "h-3.5 w-1.5 rounded-full bg-white/12"} />
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* caption */}
          <p className="mt-4 pl-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            Scores publish within minutes · feedback to every speaker
          </p>
        </div>
      </Container>
    </section>
  );
}
