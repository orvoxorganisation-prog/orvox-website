import { requirePermission } from "@/lib/admin/dal";
import { listNavItems } from "@/lib/admin/data/cms";
import { AdminPageHeader } from "@/components/admin/ui";
import { NavManager } from "./nav-manager";

export const metadata = { title: "Navigation" };

export default async function NavigationPage() {
  await requirePermission("content:read");
  const items = await listNavItems();
  return (
    <>
      <AdminPageHeader title="Navigation" description="Manage the header and footer menus shown across the site." />
      <NavManager items={items} />
    </>
  );
}
