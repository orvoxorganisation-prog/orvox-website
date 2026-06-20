import { requirePermission } from "@/lib/admin/dal";
import { can } from "@/lib/admin/rbac";
import { listMedia } from "@/lib/admin/data/media";
import { AdminPageHeader } from "@/components/admin/ui";
import { SearchInput } from "@/components/admin/toolbar";
import { MediaLibrary } from "./media-library";

export const metadata = { title: "Media" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requirePermission("media:read");
  const sp = await searchParams;
  const items = await listMedia({ search: sp.q });

  return (
    <>
      <AdminPageHeader title="Media library" description="Upload, organize, and manage images used across the site." />
      <div className="mb-4">
        <SearchInput placeholder="Search media…" />
      </div>
      <MediaLibrary items={items} canDelete={can(admin.role, "media:delete")} />
    </>
  );
}
