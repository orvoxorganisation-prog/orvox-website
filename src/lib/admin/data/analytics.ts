import "server-only";
import { requireSql } from "@/lib/db/client";

export interface DashboardMetrics {
  totalUsers: number;
  bannedUsers: number;
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitlistRegistrations: number;
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  liveEvents: number;
  totalResources: number;
  newUsers7d: number;
  newRegistrations7d: number;
  seatsTotal: number;
  seatsFilled: number;
  fillRate: number; // 0..1
  conversionRate: number; // registrations / users
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const sql = requireSql();
  const [users] = (await sql`
    select count(*)::int as total,
      count(*) filter (where status = 'banned')::int as banned,
      count(*) filter (where created_at > now() - interval '7 days')::int as new7d
    from accounts
  `) as Array<{ total: number; banned: number; new7d: number }>;

  const [regs] = (await sql`
    select count(*)::int as total,
      count(*) filter (where status = 'confirmed')::int as confirmed,
      count(*) filter (where status = 'waitlist')::int as waitlist,
      count(*) filter (where registered_at > now() - interval '7 days')::int as new7d
    from registrations
  `) as Array<{ total: number; confirmed: number; waitlist: number; new7d: number }>;

  const [events] = (await sql`
    select count(*)::int as total,
      count(*) filter (where published)::int as published,
      count(*) filter (where not published)::int as draft,
      count(*) filter (where status = 'live')::int as live,
      coalesce(sum(seats_total), 0)::int as seats_total,
      coalesce(sum(seats_filled), 0)::int as seats_filled
    from events
  `) as Array<{ total: number; published: number; draft: number; live: number; seats_total: number; seats_filled: number }>;

  const [resources] = (await sql`select count(*)::int as total from resources`) as Array<{ total: number }>;

  const fillRate = events.seats_total > 0 ? events.seats_filled / events.seats_total : 0;
  const conversionRate = users.total > 0 ? regs.total / users.total : 0;

  return {
    totalUsers: users.total,
    bannedUsers: users.banned,
    totalRegistrations: regs.total,
    confirmedRegistrations: regs.confirmed,
    waitlistRegistrations: regs.waitlist,
    totalEvents: events.total,
    publishedEvents: events.published,
    draftEvents: events.draft,
    liveEvents: events.live,
    totalResources: resources.total,
    newUsers7d: users.new7d,
    newRegistrations7d: regs.new7d,
    seatsTotal: events.seats_total,
    seatsFilled: events.seats_filled,
    fillRate,
    conversionRate,
  };
}

export async function getRecentActivity(limit = 8): Promise<Array<{ adminEmail: string; action: string; entityType: string; summary: string; createdAt: string }>> {
  const rows = (await requireSql()`
    select admin_email, action, entity_type, summary, created_at
    from audit_logs order by created_at desc limit ${limit}
  `) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    adminEmail: r.admin_email as string,
    action: r.action as string,
    entityType: r.entity_type as string,
    summary: r.summary as string,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));
}

export async function getRegistrationTrend(days = 30): Promise<Array<{ day: string; count: number }>> {
  const rows = (await requireSql()`
    select to_char(date_trunc('day', registered_at), 'YYYY-MM-DD') as day, count(*)::int as count
    from registrations
    where registered_at > now() - (${days} || ' days')::interval
    group by day order by day asc
  `) as Array<{ day: string; count: number }>;
  return rows;
}
