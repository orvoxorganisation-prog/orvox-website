import { requirePermission } from "@/lib/admin/dal";
import { can } from "@/lib/admin/rbac";
import { listAccounts } from "@/lib/admin/data/accounts";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { SearchInput, FilterSelect } from "@/components/admin/toolbar";
import { UsersTable } from "./users-table";

export const metadata = { title: "Users" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const admin = await requirePermission("users:read");
  const sp = await searchParams;
  const { rows, total } = await listAccounts({ search: sp.q, status: sp.status, limit: 500 });

  return (
    <>
      <AdminPageHeader title="Users" description={`${total} participant account${total === 1 ? "" : "s"}.`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search name, email, school…" />
        <FilterSelect
          paramKey="status"
          placeholder="Status"
          options={[
            { value: "active", label: "Active" },
            { value: "banned", label: "Banned" },
          ]}
        />
      </div>

      <Panel className="overflow-hidden">
        <UsersTable rows={rows} canWrite={can(admin.role, "users:write")} />
      </Panel>
    </>
  );
}
