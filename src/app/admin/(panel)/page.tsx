import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Users, Ticket, Activity } from "lucide-react";
import { requirePermission } from "@/lib/admin/dal";
import { getDashboardMetrics, getRecentActivity, getRegistrationTrend } from "@/lib/admin/data/analytics";
import { AdminPageHeader, Panel, PanelHeader, StatCard, EmptyState, LinkButton } from "@/components/admin/ui";
import { formatCount } from "@/lib/utils";
import { Trend } from "@/components/admin/trend";

export default async function AdminDashboard() {
  const admin = await requirePermission("analytics:read");
  const [metrics, activity, trend] = await Promise.all([
    getDashboardMetrics(),
    getRecentActivity(8),
    getRegistrationTrend(30),
  ]);

  const firstName = admin.name.split(" ")[0];

  return (
    <>
      <AdminPageHeader
        title={`Welcome back, ${firstName}`}
        description="A live read on the ORVOX season — users, registrations, and event performance."
        actions={<LinkButton href="/admin/events/new" variant="yellow"><CalendarPlus className="h-4 w-4" /> New event</LinkButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={formatCount(metrics.totalUsers)} sub={`${formatCount(metrics.newUsers7d)} new this week`} accent="teal" />
        <StatCard label="Registrations" value={formatCount(metrics.totalRegistrations)} sub={`${formatCount(metrics.confirmedRegistrations)} confirmed · ${formatCount(metrics.waitlistRegistrations)} waitlist`} accent="yellow" />
        <StatCard label="Events" value={formatCount(metrics.totalEvents)} sub={`${formatCount(metrics.publishedEvents)} live · ${formatCount(metrics.draftEvents)} drafts`} />
        <StatCard label="Seat fill rate" value={`${Math.round(metrics.fillRate * 100)}%`} sub={`${formatCount(metrics.seatsFilled)} / ${formatCount(metrics.seatsTotal)} seats`} accent="rose" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Registrations · last 30 days" description={`${formatCount(metrics.newRegistrations7d)} in the last 7 days`} />
          <div className="p-5">
            {trend.length > 0 ? (
              <Trend data={trend} />
            ) : (
              <EmptyState title="No registrations yet" description="As participants sign up for events, the trend will appear here." />
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Quick stats" />
          <dl className="divide-y divide-white/6">
            <Row label="Conversion (regs / users)" value={`${Math.round(metrics.conversionRate * 100)}%`} />
            <Row label="Live events" value={formatCount(metrics.liveEvents)} />
            <Row label="Draft events" value={formatCount(metrics.draftEvents)} />
            <Row label="Resources" value={formatCount(metrics.totalResources)} />
            <Row label="Banned users" value={formatCount(metrics.bannedUsers)} />
          </dl>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Recent activity"
            description="The latest admin actions"
            actions={<Link href="/admin/audit" className="text-xs text-ink-400 hover:text-ink-100">View all</Link>}
          />
          {activity.length > 0 ? (
            <ul className="divide-y divide-white/6">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-ink-400">
                    <Activity className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-200">{a.summary}</p>
                    <p className="text-xs text-ink-500">
                      {a.adminEmail} · {new Date(a.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No activity yet" description="Admin actions will be recorded here." />
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Jump to" />
          <div className="grid gap-2 p-4">
            <QuickLink href="/admin/events" Icon={CalendarPlus} label="Manage events" />
            <QuickLink href="/admin/registrations" Icon={Ticket} label="View registrations" />
            <QuickLink href="/admin/users" Icon={Users} label="Manage users" />
          </div>
        </Panel>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className="text-sm text-ink-400">{label}</dt>
      <dd className="font-mono text-sm font-semibold tabular-nums text-ink-100">{value}</dd>
    </div>
  );
}

function QuickLink({ href, Icon, label }: { href: string; Icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-ink-200 ring-1 ring-inset ring-white/8 transition-colors hover:bg-white/[0.06] hover:text-canvas"
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-ink-400" />
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4 text-ink-500" />
    </Link>
  );
}
