import { CalendarPlus } from "lucide-react";
import { requirePermission } from "@/lib/admin/dal";
import { can } from "@/lib/admin/rbac";
import { adminListEvents } from "@/lib/admin/data/events";
import { AdminPageHeader, Panel, LinkButton } from "@/components/admin/ui";
import { SearchInput, FilterSelect } from "@/components/admin/toolbar";
import { EventsTable } from "./events-table";

export const metadata = { title: "Events" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; track?: string; status?: string; published?: string }>;
}) {
  const admin = await requirePermission("events:read");
  const sp = await searchParams;
  let events = await adminListEvents();

  if (sp.q) {
    const q = sp.q.toLowerCase();
    events = events.filter((e) => e.title.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q) || e.city.toLowerCase().includes(q));
  }
  if (sp.track) events = events.filter((e) => e.track === sp.track);
  if (sp.status) events = events.filter((e) => e.status === sp.status);
  if (sp.published === "true") events = events.filter((e) => e.published);
  if (sp.published === "false") events = events.filter((e) => !e.published);

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Create, publish, duplicate, and manage every event on the platform."
        actions={
          can(admin.role, "events:write") ? (
            <LinkButton href="/admin/events/new" variant="yellow">
              <CalendarPlus className="h-4 w-4" /> New event
            </LinkButton>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search events…" />
        <FilterSelect
          paramKey="track"
          placeholder="Track"
          options={[
            { value: "debate", label: "Debate" },
            { value: "pitch", label: "Pitch" },
            { value: "speaking", label: "Speaking" },
            { value: "oped", label: "Op-Ed" },
          ]}
        />
        <FilterSelect
          paramKey="status"
          placeholder="Status"
          options={[
            { value: "open", label: "Open" },
            { value: "closing-soon", label: "Closing soon" },
            { value: "live", label: "Live" },
            { value: "upcoming", label: "Upcoming" },
            { value: "closed", label: "Closed" },
          ]}
        />
        <FilterSelect
          paramKey="published"
          placeholder="Visibility"
          options={[
            { value: "true", label: "Published" },
            { value: "false", label: "Draft" },
          ]}
        />
      </div>

      <Panel className="overflow-hidden">
        <EventsTable events={events} canDelete={can(admin.role, "events:delete")} canFeature={can(admin.role, "controls:write")} />
      </Panel>
    </>
  );
}
