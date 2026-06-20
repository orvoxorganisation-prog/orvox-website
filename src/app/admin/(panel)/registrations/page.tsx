import { Download } from "lucide-react";
import { requirePermission } from "@/lib/admin/dal";
import { can } from "@/lib/admin/rbac";
import { listRegistrations } from "@/lib/admin/data/registrations";
import { adminListEvents } from "@/lib/admin/data/events";
import { AdminPageHeader, Panel, LinkButton } from "@/components/admin/ui";
import { SearchInput, FilterSelect } from "@/components/admin/toolbar";
import { RegistrationsTable } from "./regs-table";

export const metadata = { title: "Registrations" };

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; event?: string; status?: string }>;
}) {
  const admin = await requirePermission("registrations:read");
  const sp = await searchParams;
  const [{ rows, total }, events] = await Promise.all([
    listRegistrations({ search: sp.q, eventSlug: sp.event, status: sp.status, limit: 500 }),
    adminListEvents(),
  ]);

  const exportHref = `/admin/registrations/export${sp.event ? `?event=${sp.event}` : ""}`;

  return (
    <>
      <AdminPageHeader
        title="Registrations"
        description={`${total} registration${total === 1 ? "" : "s"} across all events.`}
        actions={
          can(admin.role, "registrations:export") ? (
            <LinkButton href={exportHref} variant="ghost">
              <Download className="h-4 w-4" /> Export CSV
            </LinkButton>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search name, email, school…" />
        <FilterSelect
          paramKey="event"
          placeholder="Event"
          options={events.map((e) => ({ value: e.slug, label: e.title }))}
        />
        <FilterSelect
          paramKey="status"
          placeholder="Status"
          options={[
            { value: "confirmed", label: "Confirmed" },
            { value: "waitlist", label: "Waitlist" },
          ]}
        />
      </div>

      <Panel className="overflow-hidden">
        <RegistrationsTable rows={rows} canWrite={can(admin.role, "registrations:write")} />
      </Panel>
    </>
  );
}
