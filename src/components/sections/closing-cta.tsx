"use client";

import Link from "next/link";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Magnetic } from "@/components/motion/magnetic";
import { WordReveal } from "@/components/motion/word-reveal";
import { Equalizer } from "@/components/ui/equalizer";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-white/8 bg-stage text-canvas">
      <Container className="relative flex flex-col items-center py-32 text-center sm:py-44">
        <span className="inline-flex items-center gap-2.5 rounded-full glass-dark px-4 py-2">
          <Equalizer live className="h-3.5 text-yellow" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-200">Applications close soon</span>
        </span>

        <WordReveal
          as="h2"
          trigger
          className="mt-9 max-w-4xl text-[clamp(2.75rem,8vw,6rem)] font-bold leading-[0.95] tracking-[-0.04em]"
          stagger={0.05}
        >
          <span className="block">
            The room is <em className="text-teal">yours.</em>
          </span>
          <span className="block">Take it.</span>
        </WordReveal>

        <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-300">
          One form, two minutes. Bring a partner and a thesis. We bring the room,
          the panel, and the result.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic strength={0.4}>
            <Link
              href="/signup"
              className="group flex items-center gap-2.5 rounded-full bg-canvas py-2.5 pl-7 pr-2.5 text-base font-semibold text-stage transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            >
              Get your seat
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
            </Link>
          </Magnetic>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-medium text-ink-200 ring-1 ring-inset ring-white/12 transition-colors hover:bg-white/5 hover:text-canvas"
          >
            Browse events
            <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>

        <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-400">
          Mumbai · 11-14 Jul 2026 · orvox.in/s03
        </p>
      </Container>
    </section>
  );
}
