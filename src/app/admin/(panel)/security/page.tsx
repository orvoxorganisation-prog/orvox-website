import { requireAdmin } from "@/lib/admin/dal";
import { getAdminMfa } from "@/lib/admin/data/admins";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { MfaManager } from "./mfa-manager";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const admin = await requireAdmin();
  const mfa = await getAdminMfa(admin.id);

  return (
    <>
      <AdminPageHeader title="Security" description="Protect your admin account with a second factor." />
      <div className="max-w-xl">
        <Panel className="p-6">
          <MfaManager enabled={mfa.enabled} email={admin.email} />
        </Panel>
      </div>
    </>
  );
}
