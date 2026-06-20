"use client";

import * as React from "react";

function parts(ms: number) {
  const clamped = Math.max(0, ms);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped % 86_400_000) / 3_600_000),
    mins: Math.floor((clamped % 3_600_000) / 60_000),
  };
}

/** Live deadline countdown. Tabular mono so the digits hold steady. */
export function Countdown({
  target,
  className,
  closedLabel = "Registration closed",
}: {
  target: string;
  className?: string;
  closedLabel?: string;
}) {
  const targetMs = React.useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const remaining = targetMs - (now ?? Date.now());

  if (now !== null && remaining <= 0) {
    return <span className={className}>{closedLabel}</span>;
  }

  const { days, hours, mins } = parts(remaining);
  const cell = (value: number, label: string) => (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono text-xl font-semibold tabular [font-feature-settings:'tnum','zero']">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-ink-400">{label}</span>
    </span>
  );

  return (
    <span className={className} suppressHydrationWarning>
      <span className="flex items-baseline gap-3">
        {cell(days, "d")}
        {cell(hours, "h")}
        {cell(mins, "m")}
      </span>
    </span>
  );
}
