import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/admin/dal";
import { adminGetEvent } from "@/lib/admin/data/events";
import { AdminPageHeader, LinkButton } from "@/components/admin/ui";
import { Ticket } from "lucide-react";
import { EventForm } from "../event-form";
import { updateEventAction } from "../actions";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("events:write");
  const { id } = await params;
  const event = await adminGetEvent(id);
  if (!event) notFound();

  return (
    <>
      <AdminPageHeader
        title={`Edit · ${event.title}`}
        description={`/${event.slug}`}
        actions={
          <LinkButton href={`/admin/registrations?event=${event.slug}`} variant="ghost">
            <Ticket className="h-4 w-4" /> Registrations
          </LinkButton>
        }
      />
      <EventForm event={event} action={updateEventAction.bind(null, event.id)} />
    </>
  );
}
