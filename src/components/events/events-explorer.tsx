"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SearchX } from "lucide-react";
import type { OrvoxEvent, Track } from "@/lib/data/types";
import { EventCard } from "./event-card";
import { trackLabel } from "@/lib/accent";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type TrackFilter = Track | "all";

const filters: { value: TrackFilter; label: string }[] = [
  { value: "all", label: "All tracks" },
  { value: "debate", label: trackLabel.debate },
  { value: "speaking", label: trackLabel.speaking },
  { value: "pitch", label: trackLabel.pitch },
  { value: "oped", label: trackLabel.oped },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The season fixture list: a glass filter rail, one flagship billboard,
 * and the rest of the slate as broadcast-schedule rows.
 */
export function EventsExplorer({
  events,
  initialTrack = "all",
}: {
  events: OrvoxEvent[];
  initialTrack?: TrackFilter;
}) {
  const [track, setTrack] = React.useState<TrackFilter>(initialTrack);
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  const visible = React.useMemo(
    () => (track === "all" ? events : events.filter((e) => e.track === track)),
    [events, track],
  );

  // Staggered entrance for the billboard + fixture rows; re-fires per filter.
  useGSAP(
    () => {
      if (reduce || !listRef.current) return;
      gsap.from(listRef.current.querySelectorAll("[data-entrance]"), {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: listRef.current, start: "top 88%", once: true },
      });
    },
    { scope: listRef, dependencies: [reduce, track] },
  );

  // The flagship: the first event still taking registrations, else the first.
  const flagship = visible.find((e) => e.status === "live" || e.status === "open") ?? visible[0];
  const rest = visible.filter((e) => e !== flagship);

  return (
    <div>
      {/* Segmented glass filter rail */}
      <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
        <div className="inline-flex shrink-0 items-center gap-1 rounded-full panel p-1.5">
          {filters.map((f) => {
            const active = track === f.value;
            const count =
              f.value === "all" ? events.length : events.filter((e) => e.track === f.value).length;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setTrack(f.value)}
                aria-pressed={active}
                className={cn(
                  "press relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
                  active ? "text-ink-900" : "text-ink-300 hover:text-canvas",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="track-pill"
                    className="absolute inset-0 rounded-full bg-canvas"
                    transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
                  />
                )}
                <span className="relative">{f.label}</span>
                <span
                  className={cn(
                    "relative font-mono text-[11px] tabular",
                    active ? "text-ink-500" : "text-ink-400",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={track}
          ref={listRef}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {visible.length > 0 ? (
            <>
              {flagship && (
                <div data-entrance>
                  <EventCard event={flagship} variant="billboard" className="mt-10" />
                </div>
              )}
              {rest.length > 0 && (
                <div className="mt-6 border-t border-white/8">
                  {rest.map((event) => (
                    <div key={event.id} data-entrance>
                      <EventCard event={event} variant="row" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 flex flex-col items-center justify-center rounded-card border border-dashed border-white/12 bg-white/[0.02] py-20 text-center">
              <SearchX className="h-7 w-7 text-ink-500" strokeWidth={1.5} />
              <p className="mt-4 text-sm font-medium text-ink-200">No events in this track yet</p>
              <p className="mt-1 text-sm text-ink-400">Check another track, or come back next season.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
