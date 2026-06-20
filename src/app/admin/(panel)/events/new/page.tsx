import { requirePermission } from "@/lib/admin/dal";
import { AdminPageHeader } from "@/components/admin/ui";
import { EventForm } from "../event-form";
import { createEventAction } from "../actions";

export const metadata = { title: "New event" };

export default async function NewEventPage() {
  await requirePermission("events:write");
  return (
    <>
      <AdminPageHeader title="New event" description="Draft a new event. Save as a draft or publish it live." />
      <EventForm action={createEventAction} />
    </>
  );
}
