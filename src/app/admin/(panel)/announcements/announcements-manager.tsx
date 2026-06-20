"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/ui/select-field";
import { Panel, PanelHeader, FormField } from "@/components/admin/ui";
import { SubmitButton, ConfirmSubmit } from "@/components/admin/actions-ui";
import { formatDate } from "@/lib/utils";
import type { AdminAnnouncement } from "@/lib/admin/data/cms";
import { createAnnouncementAction, updateAnnouncementAction, deleteAnnouncementAction, type AnnResult } from "./actions";

const TYPES = ["reminder", "schedule", "result", "feedback"];

function TypeSelect({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue ?? "reminder");
  return (
    <>
      <input type="hidden" name="type" value={value} />
      <SelectField value={value} onValueChange={setValue} options={TYPES} />
    </>
  );
}

export function AnnouncementsManager({ items }: { items: AdminAnnouncement[] }) {
  return (
    <div className="space-y-4">
      <CreateForm />
      {items.length === 0 ? (
        <p className="text-sm text-ink-400">No announcements yet.</p>
      ) : (
        items.map((a) => <EditForm key={a.id} ann={a} />)
      )}
    </div>
  );
}

function CreateForm() {
  const [state, formAction] = useActionState<AnnResult, FormData>(createAnnouncementAction, { ok: false });
  const ref = React.useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (state.ok) {
      toast.success("Announcement posted");
      ref.current?.reset();
      setOpen(false);
    } else if (state.error) toast.error(state.error);
  }, [state]);

  if (!open) return <Button variant="yellow" size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New announcement</Button>;

  return (
    <Panel>
      <PanelHeader title="New announcement" />
      <form ref={ref} action={formAction} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <FormField label="Type"><TypeSelect /></FormField>
          <FormField label="Title" required><Input name="title" required /></FormField>
        </div>
        <FormField label="Body"><Textarea name="body" rows={2} /></FormField>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <FormField label="Link (optional)"><Input name="href" placeholder="/events" /></FormField>
          <label className="flex items-center gap-3 self-end rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/8">
            <input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-yellow" />
            <span className="text-sm text-ink-200">Published</span>
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <SubmitButton variant="yellow" size="sm" pendingLabel="Posting…">Post</SubmitButton>
        </div>
      </form>
    </Panel>
  );
}

function EditForm({ ann }: { ann: AdminAnnouncement }) {
  const [state, formAction] = useActionState<AnnResult, FormData>(updateAnnouncementAction, { ok: false });
  React.useEffect(() => {
    if (state.ok) toast.success("Saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Panel>
      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="id" value={ann.id} />
        <div className="flex items-center gap-2">
          <Badge variant={ann.published ? "success" : "muted"} size="sm">{ann.published ? "Published" : "Hidden"}</Badge>
          <span className="text-xs text-ink-500">{formatDate(ann.date)}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <FormField label="Type"><TypeSelect defaultValue={ann.type} /></FormField>
          <FormField label="Title"><Input name="title" defaultValue={ann.title} required /></FormField>
        </div>
        <FormField label="Body"><Textarea name="body" rows={2} defaultValue={ann.body} /></FormField>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <FormField label="Link (optional)"><Input name="href" defaultValue={ann.href ?? ""} /></FormField>
          <label className="flex items-center gap-3 self-end rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/8">
            <input type="checkbox" name="published" defaultChecked={ann.published} className="h-4 w-4 accent-yellow" />
            <span className="text-sm text-ink-200">Published</span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <ConfirmSubmit
            action={deleteAnnouncementAction}
            hidden={{ id: ann.id }}
            title="Delete announcement?"
            description="This removes it from the site."
            confirmLabel="Delete"
            trigger={<Button variant="ghost" size="sm" type="button" className="text-danger hover:text-danger"><Trash2 className="h-4 w-4" /> Delete</Button>}
          />
          <SubmitButton variant="yellow" size="sm" pendingLabel="Saving…">Save</SubmitButton>
        </div>
      </form>
    </Panel>
  );
}
