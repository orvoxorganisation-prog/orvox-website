import { getCurrentAdmin } from "@/lib/admin/dal";
import { can } from "@/lib/admin/rbac";
import { exportRegistrationsCsv } from "@/lib/admin/data/registrations";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });
  if (!can(admin.role, "registrations:export")) return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const event = url.searchParams.get("event");
  const csv = await exportRegistrationsCsv(event);

  await logAudit({
    admin,
    action: "export",
    entityType: "registration",
    summary: `Exported registrations${event ? ` for ${event}` : ""} (CSV)`,
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `orvox-registrations${event ? `-${event}` : ""}-${stamp}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
