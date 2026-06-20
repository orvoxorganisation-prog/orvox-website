import { requirePermission } from "@/lib/admin/dal";
import { listAdmins } from "@/lib/admin/data/admins";
import { AdminPageHeader } from "@/components/admin/ui";
import { AdminsManager } from "./admins-manager";

export const metadata = { title: "Admins" };

export default async function AdminsPage() {
  const actor = await requirePermission("admins:manage");
  const admins = await listAdmins();
  return (
    <>
      <AdminPageHeader title="Admins & roles" description="Manage who can access the control panel and what they can do." />
      <AdminsManager admins={admins} currentId={actor.id} />
    </>
  );
}
