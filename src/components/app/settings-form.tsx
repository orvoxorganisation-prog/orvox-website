"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

const notificationRows = [
  { key: "schedule", label: "Schedule changes", desc: "Round times, room moves, and venue updates.", on: true },
  { key: "results", label: "Result announcements", desc: "When standings publish for your rooms.", on: true },
  { key: "feedback", label: "Feedback available", desc: "When a judge posts written feedback.", on: true },
  { key: "updates", label: "Product updates", desc: "New events, features, and the occasional note.", on: false },
];

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const [savingProfile, setSavingProfile] = React.useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingProfile(false);
    toast.success("Profile saved");
  };

  return (
    <Reveal stagger={0.1} className="space-y-10">
      {/* Notifications */}
      <section data-reveal aria-label="Notifications" className="rounded-feature panel p-6 sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight text-canvas">Notifications</h2>
        <p className="mt-1 text-sm text-ink-400">Choose what lands in your inbox.</p>
        <ul className="mt-6 divide-y divide-white/6">
          {notificationRows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-6 py-4">
              <div>
                <p className="text-sm font-medium text-ink-100">{row.label}</p>
                <p className="mt-0.5 text-[13px] text-ink-400">{row.desc}</p>
              </div>
              <Switch
                defaultChecked={row.on}
                label={row.label}
                onCheckedChange={(v) => toast.message(`${row.label} ${v ? "on" : "off"}`)}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Account */}
      <section data-reveal aria-label="Account" className="rounded-feature panel p-6 sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight text-canvas">Account</h2>
        <form onSubmit={saveProfile} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="set-name">
              <Input id="set-name" defaultValue={name} />
            </Field>
            <Field label="Email" htmlFor="set-email">
              <Input id="set-email" type="email" defaultValue={email} />
            </Field>
          </div>
          <Button type="submit" size="md" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>

      {/* Danger zone */}
      <section data-reveal aria-label="Danger zone" className="rounded-feature bg-danger/[0.04] p-6 ring-1 ring-inset ring-danger/20 sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight text-danger">Danger zone</h2>
        <p className="mt-1 text-sm text-ink-400">
          Delete your account and everything tied to it. This can't be undone.
        </p>
        <button
          type="button"
          onClick={() => toast.error("Account deletion is disabled in this demo")}
          className="press mt-5 inline-flex h-10 items-center rounded-full bg-danger/10 px-5 text-sm font-medium text-danger ring-1 ring-inset ring-danger/30 transition-colors hover:bg-danger/15"
        >
          Delete account
        </button>
      </section>
    </Reveal>
  );
}
