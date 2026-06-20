"use client";

import * as React from "react";
import Link from "next/link";
import { AlertDialog } from "radix-ui";
import { Pencil, Copy, Trash2, Eye, EyeOff, Star, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TR, TD, EmptyState } from "@/components/admin/ui";
import { ConfirmSubmit, ActionForm } from "@/components/admin/actions-ui";
import { cn } from "@/lib/utils";
import type { AdminEvent } from "@/lib/db/events";
import {
  duplicateEventAction,
  togglePublishAction,
  toggleFeatureAction,
  deleteEventAction,
  bulkEventAction,
} from "./actions";

const statusVariant: Record<string, "yellow" | "teal" | "rose" | "muted" | "warning"> = {
  open: "teal",
  "closing-soon": "warning",
  live: "rose",
  upcoming: "muted",
  closed: "muted",
};

export function EventsTable({
  events,
  canDelete,
  canFeature,
}: {
  events: AdminEvent[];
  canDelete: boolean;
  canFeature: boolean;
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const bulkRef = React.useRef<HTMLFormElement>(null);
  const [op, setOp] = React.useState("");

  const allSelected = events.length > 0 && selected.size === events.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(events.map((e) => e.id)));
  const toggle = (idVal: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idVal)) next.delete(idVal);
      else next.add(idVal);
      return next;
    });

  function runBulk(operation: string) {
    setOp(operation);
    // Defer so the hidden op input picks up the new value before submit.
    requestAnimationFrame(() => bulkRef.current?.requestSubmit());
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events match"
        description="Try clearing filters, or create your first event."
        action={
          <Link href="/admin/events/new" className="mt-2 inline-flex h-9 items-center rounded-full bg-yellow px-4 text-[13px] font-medium text-ink-900">
            New event
          </Link>
        }
      />
    );
  }

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/8 bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-ink-300">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => runBulk("publish")}>
              <Eye className="h-4 w-4" /> Publish
            </Button>
            <Button variant="ghost" size="sm" onClick={() => runBulk("unpublish")}>
              <EyeOff className="h-4 w-4" /> Unpublish
            </Button>
            {canDelete ? (
              <AlertDialog.Root>
                <AlertDialog.Trigger asChild>
                  <Button variant="danger" size="sm">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
                  <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface-2 p-6 ring-1 ring-inset ring-white/12 motion-safe:animate-pop-in">
                    <AlertDialog.Title className="text-base font-semibold text-ink-50">Delete {selected.size} events?</AlertDialog.Title>
                    <AlertDialog.Description className="mt-2 text-sm text-ink-400">
                      This permanently removes the selected events and their schedules. This cannot be undone.
                    </AlertDialog.Description>
                    <div className="mt-6 flex justify-end gap-2">
                      <AlertDialog.Cancel asChild>
                        <Button variant="ghost" size="sm">Cancel</Button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <Button variant="danger" size="sm" onClick={() => runBulk("delete")}>
                          Delete all
                        </Button>
                      </AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Hidden bulk form for publish/unpublish (ids as repeated inputs) */}
      <form ref={bulkRef} action={bulkEventAction} className="hidden">
        <input type="hidden" name="op" value={op} />
        {[...selected].map((idVal) => (
          <input key={idVal} type="hidden" name="ids" value={idVal} />
        ))}
      </form>

      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="w-10">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-yellow" aria-label="Select all" />
            </TH>
            <TH>Event</TH>
            <TH>Status</TH>
            <TH>Seats</TH>
            <TH>Visibility</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {events.map((e) => {
            const pct = e.seatsTotal > 0 ? Math.round((e.seatsFilled / e.seatsTotal) * 100) : 0;
            return (
              <TR key={e.id}>
                <TD>
                  <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} className="h-4 w-4 accent-yellow" aria-label={`Select ${e.title}`} />
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    {e.featured ? <Star className="h-3.5 w-3.5 shrink-0 fill-yellow text-yellow" /> : null}
                    <div className="min-w-0">
                      <Link href={`/admin/events/${e.id}`} className="block truncate font-medium text-ink-100 hover:text-canvas">
                        {e.title}
                      </Link>
                      <span className="text-xs text-ink-500">/{e.slug} · {e.track}</span>
                    </div>
                  </div>
                </TD>
                <TD>
                  <Badge variant={statusVariant[e.status] ?? "muted"} size="sm">
                    {e.status}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <div className={cn("h-full rounded-full", pct >= 100 ? "bg-danger" : "bg-teal")} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <span className="font-mono text-xs tabular-nums text-ink-400">
                      {e.seatsFilled}/{e.seatsTotal}
                    </span>
                  </div>
                </TD>
                <TD>
                  {e.published ? (
                    <Badge variant="success" size="sm">Published</Badge>
                  ) : (
                    <Badge variant="muted" size="sm">Draft</Badge>
                  )}
                </TD>
                <TD>
                  <div className="flex items-center justify-end gap-1">
                    <IconLink href={`/admin/registrations?event=${e.slug}`} title="Registrations">
                      <Ticket className="h-4 w-4" />
                    </IconLink>
                    <IconLink href={`/admin/events/${e.id}`} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </IconLink>
                    <ActionForm action={togglePublishAction} hidden={{ id: e.id, publish: String(!e.published) }}>
                      <IconButton title={e.published ? "Unpublish" : "Publish"}>
                        {e.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </IconButton>
                    </ActionForm>
                    {canFeature ? (
                      <ActionForm action={toggleFeatureAction} hidden={{ id: e.id, feature: String(!e.featured) }}>
                        <IconButton title={e.featured ? "Unfeature" : "Feature"}>
                          <Star className={cn("h-4 w-4", e.featured && "fill-yellow text-yellow")} />
                        </IconButton>
                      </ActionForm>
                    ) : null}
                    <ActionForm action={duplicateEventAction} hidden={{ id: e.id }}>
                      <IconButton title="Duplicate">
                        <Copy className="h-4 w-4" />
                      </IconButton>
                    </ActionForm>
                    {canDelete ? (
                      <ConfirmSubmit
                        action={deleteEventAction}
                        hidden={{ id: e.id }}
                        title={`Delete “${e.title}”?`}
                        description="This permanently removes the event, its schedule, and unlinks its registrations. This cannot be undone."
                        confirmLabel="Delete event"
                        trigger={
                          <IconButton title="Delete" danger>
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        }
                      />
                    ) : null}
                  </div>
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { title: string; danger?: boolean }
>(({ children, title, danger, className, type, ...props }, ref) => (
  <button
    ref={ref}
    type={type ?? "submit"}
    title={title}
    aria-label={title}
    className={cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5",
      danger ? "hover:text-danger" : "hover:text-canvas",
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
IconButton.displayName = "IconButton";

function IconLink({ href, children, title }: { href: string; children: React.ReactNode; title: string }) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-canvas"
    >
      {children}
    </Link>
  );
}
