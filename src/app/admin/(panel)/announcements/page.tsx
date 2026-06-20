import { requirePermission } from "@/lib/admin/dal";
import { listAnnouncements } from "@/lib/admin/data/cms";
import { AdminPageHeader } from "@/components/admin/ui";
import { AnnouncementsManager } from "./announcements-manager";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  await requirePermission("content:read");
  const items = await listAnnouncements();
  return (
    <>
      <AdminPageHeader title="Announcements" description="Broadcast updates to the wire feed across the platform." />
      <AnnouncementsManager items={items} />
    </>
  );
}
