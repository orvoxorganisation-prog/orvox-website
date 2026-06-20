import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, GraduationCap, CalendarRange } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { requireAccount, getEvents } from "@/lib/repo";
import { trackLabel } from "@/lib/accent";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const [account, events] = await Promise.all([requireAccount(), getEvents()]);
  const tracks = Array.from(
    new Set(
      account.registrations
        .map((r) => events.find((e) => e.slug === r.eventSlug)?.track)
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    ),
  );

  const facts = [
    { Icon: GraduationCap, label: "School", value: account.school ?? "Not set" },
    { Icon: MapPin, label: "City", value: account.city ?? "Not set" },
    { Icon: CalendarRange, label: "Joined", value: `Season ${account.joinedSeason.replace("S", "")}` },
  ];

  const stats = [
    { value: String(account.stats.events).padStart(2, "0"), label: "Events" },
    { value: String(account.stats.rounds).padStart(2, "0"), label: "Rounds" },
    { value: account.stats.bestRank ? `#${account.stats.bestRank}` : "·", label: "Best rank" },
    { value: account.stats.speakerAvg ? String(account.stats.speakerAvg) : "·", label: "Speaker avg" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <DashHeader
        title="Profile"
        actions={
          <Link href="/dashboard/settings" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Edit profile
          </Link>
        }
      />

      {/* Identity board */}
      <Reveal y={24} className="overflow-hidden rounded-feature panel-raised">
        <div className="relative isolate flex items-center gap-5 overflow-hidden p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-teal opacity-15 blur-[70px]"
          />
          <Avatar name={account.name} accent={account.avatarAccent} size={72} />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-canvas">{account.name}</h2>
            <p className="font-mono text-sm text-ink-400">{account.handle}</p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-white/8 bg-white/[0.02] p-7 sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <f.Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-400" strokeWidth={1.75} />
              <div>
                <p className="eyebrow">{f.label}</p>
                <p className="mt-1 text-sm font-medium text-ink-200">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Season tape */}
      <section aria-label="Season stats" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Season stats</h2>
        <Reveal stagger={0.06} className="mt-4 grid grid-cols-2 divide-white/8 overflow-hidden rounded-feature panel sm:grid-cols-4 sm:divide-x">
          {stats.map((s, i) => (
            <div key={s.label} data-reveal className={i > 1 ? "border-t border-white/8 p-5 sm:border-t-0" : "p-5"}>
              <div className="font-mono text-3xl font-semibold tabular leading-none tracking-tight text-canvas">
                {s.value}
              </div>
              <div className="eyebrow mt-2.5">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </section>

      <section aria-label="Tracks" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Competing in</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tracks.length > 0 ? (
            tracks.map((t) => (
              <Badge key={t} variant="teal">{trackLabel[t]}</Badge>
            ))
          ) : (
            <p className="text-sm text-ink-400">No tracks yet. Your registrations decide this.</p>
          )}
        </div>
      </section>
    </div>
  );
}
