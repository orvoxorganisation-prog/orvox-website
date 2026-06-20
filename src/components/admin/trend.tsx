/** Minimal dependency-free bar chart for daily counts. Server-safe. */
export function Trend({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="flex h-40 items-end gap-1">
        {data.map((d) => {
          const h = Math.max(2, Math.round((d.count / max) * 100));
          return (
            <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.count}`}>
              <div
                className="w-full rounded-t bg-gradient-to-t from-yellow-deep/60 to-yellow transition-all group-hover:from-yellow-deep group-hover:to-yellow-soft"
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
        <span>{data[0]?.day}</span>
        <span className="text-ink-300">{total} total</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}
