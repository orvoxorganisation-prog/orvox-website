"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/input";
import { Panel, PanelHeader, FormField } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/actions-ui";
import type { ContentBlock } from "@/lib/admin/types";
import { updateContentBlockAction, type ContentResult } from "./actions";

function isLong(key: string, value: string) {
  return value.length > 60 || /body|description|text|answer|summary/i.test(key);
}

function humanize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function ContentBlockCard({ block }: { block: ContentBlock }) {
  const [state, formAction] = useActionState<ContentResult, FormData>(updateContentBlockAction, { ok: false });
  React.useEffect(() => {
    if (state.ok) toast.success("Saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const entries = Object.entries(block.value).filter(([, v]) => typeof v === "string" || typeof v === "number");

  return (
    <Panel>
      <PanelHeader title={block.label} description={block.key} />
      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="key" value={block.key} />
        {entries.length === 0 ? <p className="text-sm text-ink-500">This block has no editable text fields.</p> : null}
        {entries.map(([k, v]) => {
          const value = String(v);
          return (
            <FormField key={k} label={humanize(k)}>
              {isLong(k, value) ? (
                <Textarea name={`field:${k}`} defaultValue={value} rows={3} />
              ) : (
                <Input name={`field:${k}`} defaultValue={value} />
              )}
            </FormField>
          );
        })}
        <div className="flex justify-end">
          <SubmitButton variant="yellow" size="sm" pendingLabel="Saving…">Save</SubmitButton>
        </div>
      </form>
    </Panel>
  );
}
