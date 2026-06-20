"use client";

import { Trash2, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD, EmptyState } from "@/components/admin/ui";
import { ConfirmSubmit, ActionForm } from "@/components/admin/actions-ui";
import { formatDate } from "@/lib/utils";
import type { AdminRegistration } from "@/lib/admin/types";
import { setRegistrationStatusAction, deleteRegistrationAction } from "./actions";

export function RegistrationsTable({ rows, canWrite }: { rows: AdminRegistration[]; canWrite: boolean }) {
  if (rows.length === 0) {
    return <EmptyState title="No registrations" description="Registrations will appear here as participants sign up." />;
  }
  return (
    <Table>
      <THead>
        <TR className="hover:bg-transparent">
          <TH>Participant</TH>
          <TH>Event</TH>
          <TH>School</TH>
          <TH>Category</TH>
          <TH>Status</TH>
          <TH>Registered</TH>
          {canWrite ? <TH className="text-right">Actions</TH> : null}
        </TR>
      </THead>
      <tbody>
        {rows.map((r) => (
          <TR key={r.id}>
            <TD>
              <p className="font-medium text-ink-100">{r.fullName}</p>
              <p className="text-xs text-ink-500">{r.email}</p>
            </TD>
            <TD className="text-ink-300">{r.eventTitle ?? r.eventSlug}</TD>
            <TD className="text-ink-300">{r.school}</TD>
            <TD className="text-ink-400">{r.category ?? "—"}</TD>
            <TD>
              {r.status === "confirmed" ? (
                <Badge variant="success" size="sm">Confirmed</Badge>
              ) : (
                <Badge variant="warning" size="sm">Waitlist</Badge>
              )}
            </TD>
            <TD className="whitespace-nowrap text-ink-400">{formatDate(r.registeredAt)}</TD>
            {canWrite ? (
              <TD>
                <div className="flex items-center justify-end gap-1">
                  <ActionForm
                    action={setRegistrationStatusAction}
                    hidden={{ id: String(r.id), status: r.status === "confirmed" ? "waitlist" : "confirmed" }}
                  >
                    <button
                      type="submit"
                      title={r.status === "confirmed" ? "Move to waitlist" : "Confirm"}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-canvas"
                    >
                      {r.status === "confirmed" ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                  </ActionForm>
                  <ConfirmSubmit
                    action={deleteRegistrationAction}
                    hidden={{ id: String(r.id) }}
                    title="Delete registration?"
                    description={`Remove ${r.fullName}'s registration. This cannot be undone.`}
                    confirmLabel="Delete"
                    trigger={
                      <button
                        type="button"
                        title="Delete"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    }
                  />
                </div>
              </TD>
            ) : null}
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
