"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/actions-ui";
import { Panel, PanelHeader, FormField } from "@/components/admin/ui";
import type { AdminEvent } from "@/lib/db/events";
import type { FormResult } from "./actions";

const TRACKS = ["debate", "pitch", "speaking", "oped"];
const ACCENTS = ["yellow", "teal", "rose", "stage"];
const STATUSES = ["open", "closing-soon", "live", "upcoming", "closed"];
const MODES = ["Online", "On-site", "Hybrid"];

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Radix Select that submits its value via a hidden input. */
function SelectInput({ name, options, defaultValue }: { name: string; options: string[]; defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue ?? options[0]);
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <SelectField value={value} onValueChange={setValue} options={options} />
    </>
  );
}

export function EventForm({
  event,
  action,
}: {
  event?: AdminEvent;
  action: (prev: FormResult, fd: FormData) => Promise<FormResult>;
}) {
  const [state, formAction] = useActionState(action, { ok: false });
  const err = (k: string) => state.fieldErrors?.[k];

  const [schedule, setSchedule] = React.useState(
    event?.schedule.map((s) => ({ label: s.label, date: toLocalInput(s.date), detail: s.detail })) ?? [],
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="flex items-center gap-2 rounded-xl bg-danger/12 px-4 py-3 text-sm text-danger ring-1 ring-inset ring-danger/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      ) : null}

      <Panel>
        <PanelHeader title="Basics" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
            <Input id="title" name="title" defaultValue={event?.title} required aria-invalid={!!err("title")} />
            {err("title") ? <FieldError msg={err("title")!} /> : null}
          </FormField>
          <FormField label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the title.">
            <Input id="slug" name="slug" defaultValue={event?.slug} placeholder="auto" />
          </FormField>
          <FormField label="Subtitle" htmlFor="subtitle" hint="Cinematic accent line.">
            <Input id="subtitle" name="subtitle" defaultValue={event?.subtitle} />
          </FormField>
          <FormField label="Summary" htmlFor="summary" hint="One-line listing blurb." className="sm:col-span-2">
            <Input id="summary" name="summary" defaultValue={event?.summary} />
          </FormField>
          <FormField label="Track" required>
            <SelectInput name="track" options={TRACKS} defaultValue={event?.track} />
          </FormField>
          <FormField label="Accent">
            <SelectInput name="accent" options={ACCENTS} defaultValue={event?.accent} />
          </FormField>
          <FormField label="Status">
            <SelectInput name="status" options={STATUSES} defaultValue={event?.status} />
          </FormField>
          <FormField label="Mode">
            <SelectInput name="mode" options={MODES} defaultValue={event?.mode} />
          </FormField>
          <FormField label="Season" htmlFor="season">
            <Input id="season" name="season" defaultValue={event?.season ?? "S03"} />
          </FormField>
          <FormField label="Format" htmlFor="format" hint="e.g. British Parliamentary">
            <Input id="format" name="format" defaultValue={event?.format} />
          </FormField>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Logistics" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <FormField label="Venue" htmlFor="venue">
            <Input id="venue" name="venue" defaultValue={event?.venue} />
          </FormField>
          <FormField label="City" htmlFor="city">
            <Input id="city" name="city" defaultValue={event?.city} />
          </FormField>
          <FormField label="Start date" htmlFor="startDate" required>
            <Input id="startDate" name="startDate" type="datetime-local" defaultValue={toLocalInput(event?.startDate ?? "")} aria-invalid={!!err("startDate")} />
            {err("startDate") ? <FieldError msg={err("startDate")!} /> : null}
          </FormField>
          <FormField label="End date" htmlFor="endDate" required>
            <Input id="endDate" name="endDate" type="datetime-local" defaultValue={toLocalInput(event?.endDate ?? "")} aria-invalid={!!err("endDate")} />
            {err("endDate") ? <FieldError msg={err("endDate")!} /> : null}
          </FormField>
          <FormField label="Registration deadline" htmlFor="registrationDeadline" required>
            <Input id="registrationDeadline" name="registrationDeadline" type="datetime-local" defaultValue={toLocalInput(event?.registrationDeadline ?? "")} aria-invalid={!!err("registrationDeadline")} />
            {err("registrationDeadline") ? <FieldError msg={err("registrationDeadline")!} /> : null}
          </FormField>
          <FormField label="Eligibility (short)" htmlFor="eligibility">
            <Input id="eligibility" name="eligibility" defaultValue={event?.eligibility} />
          </FormField>
          <FormField label="Seats total" htmlFor="seatsTotal">
            <Input id="seatsTotal" name="seatsTotal" type="number" min={0} defaultValue={event?.seatsTotal ?? 0} />
          </FormField>
          <FormField label="Seats filled" htmlFor="seatsFilled">
            <Input id="seatsFilled" name="seatsFilled" type="number" min={0} defaultValue={event?.seatsFilled ?? 0} />
          </FormField>
          <FormField label="Prize pool (INR)" htmlFor="prizePool" hint="Optional.">
            <Input id="prizePool" name="prizePool" type="number" min={0} defaultValue={event?.prizePool ?? ""} />
          </FormField>
          <FormField label="Hero stat value" htmlFor="heroStatValue" hint="e.g. ₹2L">
            <Input id="heroStatValue" name="heroStatValue" defaultValue={event?.heroStat.value} />
          </FormField>
          <FormField label="Hero stat label" htmlFor="heroStatLabel" hint="e.g. prize pool">
            <Input id="heroStatLabel" name="heroStatLabel" defaultValue={event?.heroStat.label} />
          </FormField>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Details" description="One item per line." />
        <div className="grid gap-4 p-5">
          <FormField label="About (paragraphs)" htmlFor="about">
            <Textarea id="about" name="about" rows={4} defaultValue={event?.about.join("\n")} />
          </FormField>
          <FormField label="Rules" htmlFor="rules">
            <Textarea id="rules" name="rules" rows={4} defaultValue={event?.rules.join("\n")} />
          </FormField>
          <FormField label="Eligibility details" htmlFor="eligibilityDetails">
            <Textarea id="eligibilityDetails" name="eligibilityDetails" rows={3} defaultValue={event?.eligibilityDetails.join("\n")} />
          </FormField>
          <FormField label="Tags" htmlFor="tags" hint="Comma-separated.">
            <Input id="tags" name="tags" defaultValue={event?.tags.join(", ")} />
          </FormField>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Schedule"
          description="Rounds and key moments."
          actions={
            <Button variant="ghost" size="sm" onClick={() => setSchedule((s) => [...s, { label: "", date: "", detail: "" }])}>
              <Plus className="h-4 w-4" /> Add round
            </Button>
          }
        />
        <div className="space-y-3 p-5">
          {schedule.length === 0 ? <p className="text-sm text-ink-500">No rounds yet. Add the first one.</p> : null}
          {schedule.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
              <Input name="schedule_label" placeholder="Round 1 · Opening" defaultValue={row.label} />
              <Input name="schedule_date" type="datetime-local" defaultValue={row.date} />
              <Input name="schedule_detail" placeholder="British Parliamentary · 4 teams/room" defaultValue={row.detail} />
              <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setSchedule((s) => s.filter((_, j) => j !== i))} aria-label="Remove round">
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Contact & visibility" />
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <FormField label="Contact name" htmlFor="contactName">
            <Input id="contactName" name="contactName" defaultValue={event?.contact.name} />
          </FormField>
          <FormField label="Contact role" htmlFor="contactRole">
            <Input id="contactRole" name="contactRole" defaultValue={event?.contact.role} />
          </FormField>
          <FormField label="Contact email" htmlFor="contactEmail">
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={event?.contact.email} />
          </FormField>
          <label className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/8">
            <input type="checkbox" name="published" defaultChecked={event ? event.published : true} className="h-4 w-4 accent-yellow" />
            <span className="text-sm text-ink-200">Published (visible on the public site)</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/8">
            <input type="checkbox" name="featured" defaultChecked={event?.featured ?? false} className="h-4 w-4 accent-yellow" />
            <span className="text-sm text-ink-200">Featured</span>
          </label>
        </div>
      </Panel>

      <div className="flex items-center justify-end gap-3">
        <Link href="/admin/events" className="text-sm text-ink-400 hover:text-ink-100">
          Cancel
        </Link>
        <SubmitButton variant="yellow" pendingLabel="Saving…">
          {event ? "Save changes" : "Create event"}
        </SubmitButton>
      </div>
    </form>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs text-danger">{msg}</p>;
}
