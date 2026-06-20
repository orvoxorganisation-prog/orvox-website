"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const steps = [
  { n: "01", title: "Register", body: "Pick an event, fill one form, get a confirmation. Solo, or bring a partner.", dot: "bg-teal", glow: "0 0 12px 2px rgba(15,188,176,0.5)" },
  { n: "02", title: "Compete", body: "Motions drop an hour before the round. You speak. The room shifts or it doesn't.", dot: "bg-yellow", glow: "0 0 12px 2px rgba(255,208,47,0.5)" },
  { n: "03", title: "Get scored", body: "Panels mark you on the rubric. Standings publish within minutes of the room closing.", dot: "bg-rose-deep", glow: "0 0 12px 2px rgba(240,139,210,0.5)" },
  { n: "04", title: "Get feedback", body: "Written notes from your judges land on your dashboard. You read them, then go again.", dot: "bg-teal", glow: "0 0 12px 2px rgba(15,188,176,0.5)" },
];

/**
 * The run of play as a broadcast timeline: the section pins while a yellow
 * playhead draws along the rule and lights each node as the scrub passes.
 * Mobile and reduced-motion get the fully lit static timeline.
 */
export function ScrollStory() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          motionOK: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { isDesktop, motionOK } = context.conditions as {
            isDesktop: boolean;
            motionOK: boolean;
          };
          if (!motionOK) return;

          const playhead = root.querySelector<HTMLElement>("[data-playhead]");
          const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", root);
          const items = gsap.utils.toArray<HTMLElement>("[data-step]", root);

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: isDesktop
              ? { trigger: root, start: "top top", end: "+=120%", pin: true, scrub: 0.6 }
              : { trigger: root, start: "top 75%", end: "bottom 60%", scrub: 0.6 },
          });

          if (playhead) {
            tl.fromTo(playhead, { scaleX: 0 }, { scaleX: 1, duration: 4 }, 0);
          }
          nodes.forEach((node, i) => {
            tl.fromTo(
              node,
              { opacity: 0.25, boxShadow: "none" },
              { opacity: 1, boxShadow: steps[i]?.glow ?? "none", duration: 0.3, ease: "power1.out" },
              i + 0.15,
            );
          });
          items.forEach((item, i) => {
            tl.fromTo(
              item,
              { opacity: 0.3, y: 14 },
              { opacity: 1, y: 0, duration: 0.55, ease: "power1.out" },
              i + 0.2,
            );
          });
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-stage py-20 text-canvas sm:py-28 lg:flex lg:min-h-svh lg:items-center lg:py-0">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/4 h-[26rem] w-[26rem] rounded-full bg-yellow opacity-[0.05] blur-[130px]"
      />
      <Container className="w-full">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-2xl text-5xl font-bold tracking-tight sm:text-6xl">
            The run of <em className="text-yellow">play.</em>
          </h2>
          <p className="max-w-xs font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            Signup to standings · one season
          </p>
        </div>

        <div className="relative mt-16 grid gap-12 lg:grid-cols-4 lg:gap-8">
          {/* the rule + playhead */}
          <span aria-hidden className="absolute left-0 right-0 top-[7px] hidden h-px bg-white/12 lg:block" />
          <span
            aria-hidden
            data-playhead
            className="absolute left-0 right-0 top-[6.5px] hidden h-0.5 origin-left bg-yellow lg:block"
          />
          {steps.map((step) => (
            <div key={step.n} className="relative">
              <span
                data-node
                className={cn("relative z-10 block h-3.5 w-3.5 rounded-full ring-4 ring-stage", step.dot)}
              />
              <div data-step>
                <div className="mt-7 font-mono text-sm text-ink-400">{step.n}</div>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-400">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
