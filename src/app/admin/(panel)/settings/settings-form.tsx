"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/input";
import { Panel, PanelHeader, FormField } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/actions-ui";
import { updateSettingsAction, type SettingsResult } from "./actions";

function humanize(key: string) {
  return key.replace(/[._]/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
function isLong(key: string, value: string) {
  return value.length > 70 || /body|description|address/i.test(key);
}

export function SettingsForm({ group, title, description, value }: { group: string; title: string; description?: string; value: Record<string, unknown> }) {
  const [state, formAction] = useActionState<SettingsResult, FormData>(updateSettingsAction, { ok: false });
  React.useEffect(() => {
    if (state.ok) toast.success("Settings saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Panel>
      <PanelHeader title={title} description={description} />
      <form action={formAction} className="space-y-5 p-5">
        <input type="hidden" name="group" value={group} />
        {Object.entries(value).map(([key, val]) => {
          if (val && typeof val === "object") {
            return (
              <fieldset key={key} className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-inset ring-white/8">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{humanize(key)}</legend>
                <div className="mt-2 space-y-4">
                  {Object.entries(val as Record<string, unknown>).map(([sub, subVal]) => {
                    const sv = String(subVal ?? "");
                    return (
                      <FormField key={sub} label={humanize(sub)}>
                        {isLong(sub, sv) ? (
                          <Textarea name={`field:${key}.${sub}`} defaultValue={sv} rows={3} />
                        ) : (
                          <Input name={`field:${key}.${sub}`} defaultValue={sv} />
                        )}
                      </FormField>
                    );
                  })}
                </div>
              </fieldset>
            );
          }
          const sv = String(val ?? "");
          return (
            <FormField key={key} label={humanize(key)}>
              {isLong(key, sv) ? (
                <Textarea name={`field:${key}`} defaultValue={sv} rows={3} />
              ) : (
                <Input name={`field:${key}`} defaultValue={sv} />
              )}
            </FormField>
          );
        })}
        <div className="flex justify-end">
          <SubmitButton variant="yellow" size="sm" pendingLabel="Saving…">Save changes</SubmitButton>
        </div>
      </form>
    </Panel>
  );
}
