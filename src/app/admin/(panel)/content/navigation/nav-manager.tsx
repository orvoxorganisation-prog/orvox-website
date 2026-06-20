"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, FormField } from "@/components/admin/ui";
import { SubmitButton, ConfirmSubmit } from "@/components/admin/actions-ui";
import type { NavItem } from "@/lib/admin/types";
import { createNavAction, updateNavAction, deleteNavAction, type NavResult } from "./actions";

export function NavManager({ items }: { items: NavItem[] }) {
  const header = items.filter((i) => i.location === "header");
  const footer = items.filter((i) => i.location === "footer");
  return (
    <div className="space-y-6">
      <NavGroup title="Header menu" location="header" items={header} showGroupLabel={false} />
      <NavGroup title="Footer menu" location="footer" items={footer} showGroupLabel />
    </div>
  );
}

function NavGroup({ title, location, items, showGroupLabel }: { title: string; location: "header" | "footer"; items: NavItem[]; showGroupLabel: boolean }) {
  return (
    <Panel>
      <PanelHeader title={title} description={`${items.length} link${items.length === 1 ? "" : "s"}`} />
      <div className="divide-y divide-white/6">
        {items.map((item) => (
          <NavRow key={item.id} item={item} showGroupLabel={showGroupLabel} />
        ))}
        <NavCreate location={location} showGroupLabel={showGroupLabel} />
      </div>
    </Panel>
  );
}

function NavRow({ item, showGroupLabel }: { item: NavItem; showGroupLabel: boolean }) {
  const [state, formAction] = useActionState<NavResult, FormData>(updateNavAction, { ok: false });
  React.useEffect(() => {
    if (state.ok) toast.success("Saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 px-5 py-4">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="location" value={item.location} />
      {showGroupLabel ? (
        <FormField label="Column" className="w-32">
          <Input name="groupLabel" defaultValue={item.groupLabel} className="h-10" />
        </FormField>
      ) : (
        <input type="hidden" name="groupLabel" value={item.groupLabel} />
      )}
      <FormField label="Label" className="min-w-32 flex-1">
        <Input name="label" defaultValue={item.label} className="h-10" required />
      </FormField>
      <FormField label="Href" className="min-w-40 flex-1">
        <Input name="href" defaultValue={item.href} className="h-10" required />
      </FormField>
      <FormField label="Pos" className="w-16">
        <Input name="position" type="number" defaultValue={item.position} className="h-10" />
      </FormField>
      <label className="flex h-10 items-center gap-2 rounded-xl bg-white/[0.03] px-3 ring-1 ring-inset ring-white/8">
        <input type="checkbox" name="enabled" defaultChecked={item.enabled} className="h-4 w-4 accent-yellow" />
        <span className="text-xs text-ink-300">On</span>
      </label>
      <SubmitButton variant="ghost" size="sm"><Save className="h-4 w-4" /> Save</SubmitButton>
      <ConfirmSubmit
        action={deleteNavAction}
        hidden={{ id: String(item.id) }}
        title="Delete link?"
        description={`Remove “${item.label}” from the ${item.location} menu.`}
        confirmLabel="Delete"
        trigger={
          <Button variant="ghost" size="sm" type="button" className="text-danger hover:text-danger"><Trash2 className="h-4 w-4" /></Button>
        }
      />
    </form>
  );
}

function NavCreate({ location, showGroupLabel }: { location: "header" | "footer"; showGroupLabel: boolean }) {
  const [state, formAction] = useActionState<NavResult, FormData>(createNavAction, { ok: false });
  const ref = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (state.ok) {
      toast.success("Link added");
      ref.current?.reset();
    } else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="flex flex-wrap items-end gap-3 bg-white/[0.015] px-5 py-4">
      <input type="hidden" name="location" value={location} />
      {showGroupLabel ? (
        <FormField label="Column" className="w-32">
          <Input name="groupLabel" placeholder="Compete" className="h-10" />
        </FormField>
      ) : (
        <input type="hidden" name="groupLabel" value="" />
      )}
      <FormField label="Label" className="min-w-32 flex-1">
        <Input name="label" placeholder="New link" className="h-10" required />
      </FormField>
      <FormField label="Href" className="min-w-40 flex-1">
        <Input name="href" placeholder="/path" className="h-10" required />
      </FormField>
      <FormField label="Pos" className="w-16">
        <Input name="position" type="number" defaultValue={99} className="h-10" />
      </FormField>
      <input type="hidden" name="enabled" value="true" />
      <SubmitButton variant="yellow" size="sm" pendingLabel="Adding…"><Plus className="h-4 w-4" /> Add</SubmitButton>
    </form>
  );
}
