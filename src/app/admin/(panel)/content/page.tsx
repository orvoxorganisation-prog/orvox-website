import Link from "next/link";
import { HelpCircle, ListTree } from "lucide-react";
import { requirePermission } from "@/lib/admin/dal";
import { listContentBlocks } from "@/lib/admin/data/cms";
import { AdminPageHeader, LinkButton } from "@/components/admin/ui";
import { ContentBlockCard } from "./content-editor";

export const metadata = { title: "Pages & text" };

export default async function ContentPage() {
  await requirePermission("content:read");
  const blocks = await listContentBlocks();

  const groups = new Map<string, typeof blocks>();
  for (const b of blocks) {
    const list = groups.get(b.grp) ?? [];
    list.push(b);
    groups.set(b.grp, list);
  }

  return (
    <>
      <AdminPageHeader
        title="Pages & text"
        description="Edit the copy that appears across the public site — hero, about, contact, footer, and more."
        actions={
          <>
            <LinkButton href="/admin/content/faqs" variant="ghost"><HelpCircle className="h-4 w-4" /> FAQs</LinkButton>
            <LinkButton href="/admin/content/navigation" variant="ghost"><ListTree className="h-4 w-4" /> Navigation</LinkButton>
          </>
        }
      />

      {blocks.length === 0 ? (
        <p className="text-sm text-ink-400">No content blocks found.</p>
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([grp, list]) => (
            <section key={grp}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">{grp}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {list.map((b) => (
                  <ContentBlockCard key={b.key} block={b} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
