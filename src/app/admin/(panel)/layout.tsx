import { requireAdmin } from "@/lib/admin/dal";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell admin={{ name: admin.name, email: admin.email, role: admin.role }}>
      {children}
    </AdminShell>
  );
}
