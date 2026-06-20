import { requirePermission } from "@/lib/admin/dal";
import { getDashboardMetrics, getRegistrationTrend } from "@/lib/admin/data/analytics";
import { registrationAnalytics } from "@/lib/admin/data/registrations";
import { AdminPageHeader, Panel, PanelHeader, StatCard, EmptyState, Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { Trend } from "@/components/admin/trend";
import { formatCount } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requirePermission("analytics:read");
  const [metrics, trend, regAnalytics] = await Promise.all([
    getDashboardMetrics(),
    getRegistrationTrend(30),
    registrationAnalytics(),
  ]);

  return (
    <>
      <AdminPageHeader title="Analytics" description="Traffic, registrations, conversion, and per-event performance." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={formatCount(metrics.totalUsers)} sub={`+${formatCount(metrics.newUsers7d)} this week`} accent="teal" />
        <StatCard label="Registrations" value={formatCount(metrics.totalRegistrations)} sub={`+${formatCount(metrics.newRegistrations7d)} this week`} accent="yellow" />
        <StatCard label="Conversion" value={`${Math.round(metrics.conversionRate * 100)}%`} sub="registrations / users" accent="rose" />
        <StatCard label="Seat fill" value={`${Math.round(metrics.fillRate * 100)}%`} sub={`${formatCount(metrics.seatsFilled)}/${formatCount(metrics.seatsTotal)}`} />
      </div>

      <Panel className="mt-4">
        <PanelHeader title="Registrations · last 30 days" />
        <div className="p-5">
          {trend.length > 0 ? <Trend data={trend} /> : <EmptyState title="No data yet" />}
        </div>
      </Panel>

      <Panel className="mt-4 overflow-hidden">
        <PanelHeader title="Event performance" description="Confirmed vs. capacity per event." />
        {regAnalytics.perEvent.length === 0 ? (
          <EmptyState title="No registrations yet" description="Per-event performance appears as participants register." />
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Event</TH>
                <TH>Confirmed</TH>
                <TH>Waitlist</TH>
                <TH>Capacity</TH>
                <TH>Fill</TH>
              </TR>
            </THead>
            <tbody>
              {regAnalytics.perEvent.map((e) => {
                const pct = e.seatsTotal > 0 ? Math.round((e.confirmed / e.seatsTotal) * 100) : 0;
                return (
                  <TR key={e.slug}>
                    <TD className="font-medium text-ink-100">{e.title}</TD>
                    <TD className="font-mono tabular-nums text-ink-200">{e.confirmed}</TD>
                    <TD className="font-mono tabular-nums text-ink-400">{e.waitlist}</TD>
                    <TD className="font-mono tabular-nums text-ink-400">{e.seatsTotal}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                          <div className={cn("h-full rounded-full", pct >= 100 ? "bg-danger" : "bg-teal")} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-ink-400">{pct}%</span>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        )}
      </Panel>
    </>
  );
}
