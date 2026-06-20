import { DashboardShell } from "@/components/app/dashboard-shell";
import { requireAccount } from "@/lib/repo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireAccount();
  return (
    <DashboardShell
      user={{ name: account.name, role: account.school ?? account.handle, accent: account.avatarAccent }}
      notifications={account.announcements.length}
    >
      {children}
    </DashboardShell>
  );
}
