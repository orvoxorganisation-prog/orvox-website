import { requirePermission } from "@/lib/admin/dal";
import { listFlags } from "@/lib/admin/data/cms";
import { adminListEvents } from "@/lib/admin/data/events";
import { AdminPageHeader, Panel, PanelHeader } from "@/components/admin/ui";
import { Toggle } from "./toggle";
import { toggleFlagAction, toggleEventFeaturedAction } from "./actions";

export const metadata = { title: "Website controls" };

const GROUP_TITLES: Record<string, { title: string; description: string }> = {
  section: { title: "Homepage sections", description: "Show or hide sections of the landing page." },
  page: { title: "Page visibility", description: "Toggle whole pages on or off." },
  banner: { title: "Banners", description: "Site-wide banners and notices." },
};

export default async function ControlsPage() {
  await requirePermission("controls:write");
  const [flags, events] = await Promise.all([listFlags(), adminListEvents()]);

  const groups = new Map<string, typeof flags>();
  for (const f of flags) {
    const list = groups.get(f.grp) ?? [];
    list.push(f);
    groups.set(f.grp, list);
  }

  return (
    <>
      <AdminPageHeader title="Website controls" description="Toggle sections and pages on or off, and feature events." />

      <div className="grid gap-4 lg:grid-cols-2">
        {[...groups.entries()].map(([grp, list]) => {
          const meta = GROUP_TITLES[grp] ?? { title: grp, description: "" };
          return (
            <Panel key={grp} className="self-start">
              <PanelHeader title={meta.title} description={meta.description} />
              <div className="divide-y divide-white/6">
                {list.map((f) => (
                  <Toggle key={f.key} action={toggleFlagAction} name="key" value={f.key} enabled={f.enabled} label={f.label} hint={f.key} />
                ))}
              </div>
            </Panel>
          );
        })}

        <Panel className="self-start">
          <PanelHeader title="Featured events" description="Featured events get prominence on the homepage and listings." />
          <div className="divide-y divide-white/6">
            {events.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink-500">No events yet.</p>
            ) : (
              events.map((e) => (
                <FeatureToggle key={e.id} id={e.id} title={e.title} featured={e.featured} />
              ))
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}

function FeatureToggle({ id, title, featured }: { id: string; title: string; featured: boolean }) {
  return (
    <Toggle
      action={toggleEventFeaturedAction}
      name="id"
      value={id}
      enabled={featured}
      label={title}
      hint={featured ? "Featured" : "Not featured"}
    />
  );
}
