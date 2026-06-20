import { requirePermission } from "@/lib/admin/dal";
import { listFaqs } from "@/lib/admin/data/cms";
import { AdminPageHeader } from "@/components/admin/ui";
import { FaqsManager } from "./faqs-manager";

export const metadata = { title: "FAQs" };

export default async function FaqsPage() {
  await requirePermission("content:read");
  const faqs = await listFaqs();
  return (
    <>
      <AdminPageHeader title="FAQs" description="Questions and answers shown on the public site." />
      <FaqsManager faqs={faqs} />
    </>
  );
}
