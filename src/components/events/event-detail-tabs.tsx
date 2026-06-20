"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Mail, Check } from "lucide-react";
import type { OrvoxEvent } from "@/lib/data/types";
import { formatDate, formatTime, cn } from "@/lib/utils";

const TABS = ["About", "Rules", "Schedule", "Eligibility", "Contact"] as const;
type Tab = (typeof TABS)[number];

export function EventDetailTabs({ event }: { event: OrvoxEvent }) {
  const [tab, setTab] = React.useState<Tab>("About");

  return (
    <div>
      {/* Tab rail */}
      <div role="tablist" aria-label="Event details" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-white/10">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors duration-150",
                active ? "text-canvas" : "text-ink-400 hover:text-ink-200",
              )}
            >
              {t}
              {active && (
                <motion.span
                  layoutId="event-tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-yellow"
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-7">
        {tab === "About" && (
          <div className="max-w-2xl space-y-4 text-[15.5px] leading-relaxed text-ink-300">
            {event.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {tab === "Rules" && (
          <ul className="max-w-2xl space-y-3">
            {event.rules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-300">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-teal">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {rule}
              </li>
            ))}
          </ul>
        )}

        {tab === "Schedule" && (
          <ol className="relative max-w-2xl space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/12">
            {event.schedule.map((round, i) => (
              <li key={i} className="relative flex gap-5 pl-8">
                <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-void bg-yellow" />
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h4 className="text-base font-semibold tracking-tight text-canvas">{round.label}</h4>
                    <span className="font-mono text-[12px] tabular text-ink-400">
                      {formatDate(round.date)} · {formatTime(round.date)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-400">{round.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {tab === "Eligibility" && (
          <ul className="max-w-2xl space-y-3">
            {event.eligibilityDetails.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {tab === "Contact" && (
          <div className="max-w-md rounded-card panel p-6">
            <p className="eyebrow">Organiser</p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-canvas">{event.contact.name}</p>
            <p className="text-sm text-ink-400">{event.contact.role}</p>
            <a
              href={`mailto:${event.contact.email}`}
              className="press mt-5 inline-flex items-center gap-2 rounded-full bg-canvas px-4 py-2.5 text-sm font-medium text-ink-900"
            >
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              {event.contact.email}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
