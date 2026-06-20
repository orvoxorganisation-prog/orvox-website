import { requirePermission } from "@/lib/admin/dal";
import { getAllSettings } from "@/lib/admin/data/cms";
import { AdminPageHeader } from "@/components/admin/ui";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings" };

const GROUPS: { key: string; title: string; description: string }[] = [
  { key: "site", title: "Site", description: "Brand name, tagline, and core identity." },
  { key: "seo", title: "SEO", description: "Default title, description, and social preview." },
  { key: "social", title: "Social links", description: "Profile URLs shown in the footer and elsewhere." },
  { key: "contact", title: "Contact information", description: "How people reach ORVOX." },
  { key: "email_templates", title: "Email templates", description: "Transactional email copy. Use {{placeholders}}." },
];

export default async function SettingsPage() {
  await requirePermission("settings:read");
  const all = await getAllSettings();

  return (
    <>
      <AdminPageHeader title="Settings" description="Global configuration for the public site." />
      <div className="grid gap-6 lg:grid-cols-2">
        {GROUPS.map((g) => (
          <SettingsForm key={g.key} group={g.key} title={g.title} description={g.description} value={all[g.key] ?? {}} />
        ))}
      </div>
    </>
  );
}
