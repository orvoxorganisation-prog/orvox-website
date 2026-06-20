"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { cn } from "@/lib/utils";

const tintBg = {
  teal: "bg-teal",
  yellow: "bg-yellow",
  rose: "bg-rose-deep",
} as const;

/**
 * Inner-page masthead — a stage under a spotlight. GSAP-choreographed
 * entrance (eyebrow → title → description → actions) and a tinted stage
 * light that drifts as you scroll, so each page opens with its own color
 * and its own moment.
 */
export function PageHeader({
  eyebrow,
  live,
  title,
  description,
  actions,
  tint,
  className,
}: {
  eyebrow?: string;
  live?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tint?: keyof typeof tintBg;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduce) return;
      gsap.from(root.querySelectorAll("[data-fade]"), {
        opacity: 0,
        y: 22,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.1,
      });
      const glow = root.querySelector("[data-glow]");
      if (glow) {
        gsap.fromTo(
          glow,
          { yPercent: -12 },
          {
            yPercent: 18,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 },
          },
        );
      }
    },
    { scope: ref, dependencies: [reduce] },
  );

  return (
    <header
      ref={ref}
      className={cn("spotlight relative overflow-hidden border-b border-white/8 pt-32 pb-14 text-canvas sm:pt-40 sm:pb-20", className)}
    >
      {tint && (
        <div
          aria-hidden
          data-glow
          className={cn(
            "pointer-events-none absolute -top-32 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]",
            tintBg[tint],
          )}
        />
      )}
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow && (
              <div data-fade>
                <Eyebrow live={live}>{eyebrow}</Eyebrow>
              </div>
            )}
            <h1 data-fade className="display-1 mt-5 text-canvas">{title}</h1>
            {description && (
              <p data-fade className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">{description}</p>
            )}
          </div>
          {actions && <div data-fade className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </Container>
    </header>
  );
}
