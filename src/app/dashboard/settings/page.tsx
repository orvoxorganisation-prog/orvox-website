import type { Metadata } from "next";
import { DashHeader } from "@/components/app/dash-header";
import { SettingsForm } from "@/components/app/settings-form";
import { requireAccount } from "@/lib/repo";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage() {
  const account = await requireAccount();
  return (
    <div className="mx-auto max-w-3xl">
      <DashHeader title="Settings" description="Notifications and account, your way." />
      <SettingsForm name={account.name} email={account.email} />
    </div>
  );
}
