import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { getEvents } from "@/lib/repo";
import { formatINR } from "@/lib/utils";

/**
 * Bold yellow broadcast poster. Every number on this board is computed from
 * the season slate — nothing is hand-typed or invented.
 */
export async function Proof() {
  const events = await getEvents();
  const seats = events.reduce((sum, e) => sum + e.seatsTotal, 0);
  const cities = new Set(events.map((e) => e.city)).size;
  const rounds = events.reduce((sum, e) => sum + e.schedule.length, 0);
  const pool = events.reduce((sum, e) => sum + (e.prizePool ?? 0), 0);

  const ribbon = [
    { value: String(events.length).padStart(2, "0"), label: "events on the slate" },
    { value: String(cities), label: "host cities" },
    { value: String(rounds), label: "scheduled rounds" },
    ...(pool > 0 ? [{ value: formatINR(pool), label: "prize pool" }] : []),
  ];

  return (
    <section className="bg-yellow text-ink-900">
      <Container className="py-24 sm:py-32">
        <Reveal className="grid items-end gap-x-12 gap-y-8 border-b-2 border-ink-900 pb-12 lg:grid-cols-[auto_1fr]">
          <div data-reveal className="leading-[0.78]">
            <CountUp value={seats} group className="font-mono text-[clamp(6rem,20vw,15rem)] font-semibold tracking-tighter" />
          </div>
          <div data-reveal className="pb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-900/60">Season 03, on the slate</p>
            <h2 className="mt-3 max-w-md text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl">
              seats across the season. Every one of them ends in a scored room.
            </h2>
          </div>
        </Reveal>

        <Reveal className="grid grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {ribbon.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              className={`py-9 ${i % 2 === 1 ? "pl-8" : ""} ${i >= 2 ? "border-t-2 border-ink-900 lg:border-t-0" : ""} ${i % 4 !== 0 ? "border-l-2 border-ink-900" : ""}`}
            >
              <div className="font-mono text-5xl font-semibold tabular tracking-tight">{s.value}</div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-900/60">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
