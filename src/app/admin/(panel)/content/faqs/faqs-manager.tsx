"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Panel, PanelHeader, FormField } from "@/components/admin/ui";
import { SubmitButton, ConfirmSubmit } from "@/components/admin/actions-ui";
import { Button } from "@/components/ui/button";
import type { Faq } from "@/lib/admin/types";
import { createFaqAction, updateFaqAction, deleteFaqAction, type FaqResult } from "./actions";

export function FaqsManager({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-4">
      <CreateFaq />
      {faqs.length === 0 ? (
        <p className="text-sm text-ink-400">No FAQs yet. Add the first one above.</p>
      ) : (
        faqs.map((f) => <EditFaq key={f.id} faq={f} />)
      )}
    </div>
  );
}

function CreateFaq() {
  const [state, formAction] = useActionState<FaqResult, FormData>(createFaqAction, { ok: false });
  const ref = React.useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (state.ok) {
      toast.success("FAQ added");
      ref.current?.reset();
      setOpen(false);
    } else if (state.error) toast.error(state.error);
  }, [state]);

  if (!open) {
    return (
      <Button variant="yellow" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add FAQ
      </Button>
    );
  }

  return (
    <Panel>
      <PanelHeader title="New FAQ" />
      <form ref={ref} action={formAction} className="space-y-4 p-5">
        <FormField label="Question" required>
          <Input name="question" required />
        </FormField>
        <FormField label="Answer" required>
          <Textarea name="answer" rows={3} required />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Category">
            <Input name="category" defaultValue="General" />
          </FormField>
          <FormField label="Position">
            <Input name="position" type="number" defaultValue={0} />
          </FormField>
          <label className="flex items-center gap-3 self-end rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/8">
            <input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-yellow" />
            <span className="text-sm text-ink-200">Published</span>
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <SubmitButton variant="yellow" size="sm" pendingLabel="Adding…">Add FAQ</SubmitButton>
        </div>
      </form>
    </Panel>
  );
}

function EditFaq({ faq }: { faq: Faq }) {
  const [state, formAction] = useActionState<FaqResult, FormData>(updateFaqAction, { ok: false });
  React.useEffect(() => {
    if (state.ok) toast.success("Saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Panel>
      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="id" value={faq.id} />
        <FormField label="Question">
          <Input name="question" defaultValue={faq.question} required />
        </FormField>
        <FormField label="Answer">
          <Textarea name="answer" rows={3} defaultValue={faq.answer} required />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Category">
            <Input name="category" defaultValue={faq.category} />
          </FormField>
          <FormField label="Position">
            <Input name="position" type="number" defaultValue={faq.position} />
          </FormField>
          <label className="flex items-center gap-3 self-end rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/8">
            <input type="checkbox" name="published" defaultChecked={faq.published} className="h-4 w-4 accent-yellow" />
            <span className="text-sm text-ink-200">Published</span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <ConfirmSubmit
            action={deleteFaqAction}
            hidden={{ id: String(faq.id) }}
            title="Delete FAQ?"
            description="This removes the FAQ from the site. This cannot be undone."
            confirmLabel="Delete"
            trigger={
              <Button variant="ghost" size="sm" type="button" className="text-danger hover:text-danger">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            }
          />
          <SubmitButton variant="yellow" size="sm" pendingLabel="Saving…">Save</SubmitButton>
        </div>
      </form>
    </Panel>
  );
}
