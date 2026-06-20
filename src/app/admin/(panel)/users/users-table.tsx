"use client";

import Link from "next/link";
import { Ban, RotateCcw, Trash2, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD, EmptyState } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/actions-ui";
import { formatDate } from "@/lib/utils";
import type { AdminAccount } from "@/lib/admin/types";
import { setUserStatusAction, deleteUserAction } from "./actions";

export function UsersTable({ rows, canWrite }: { rows: AdminAccount[]; canWrite: boolean }) {
  if (rows.length === 0) {
    return <EmptyState title="No users yet" description="Accounts appear here when people sign up or register for an event." />;
  }
  return (
    <Table>
      <THead>
        <TR className="hover:bg-transparent">
          <TH>User</TH>
          <TH>School</TH>
          <TH>Registrations</TH>
          <TH>Status</TH>
          <TH>Joined</TH>
          {canWrite ? <TH className="text-right">Actions</TH> : null}
        </TR>
      </THead>
      <tbody>
        {rows.map((u) => (
          <TR key={u.id}>
            <TD>
              <p className="font-medium text-ink-100">{u.name}</p>
              <p className="text-xs text-ink-500">{u.email}</p>
            </TD>
            <TD className="text-ink-300">{u.school ?? "—"}</TD>
            <TD>
              <Link href={`/admin/registrations?q=${encodeURIComponent(u.email)}`} className="inline-flex items-center gap-1.5 text-ink-300 hover:text-canvas">
                <Ticket className="h-3.5 w-3.5 text-ink-500" />
                {u.registrationCount}
              </Link>
            </TD>
            <TD>
              {u.status === "active" ? (
                <Badge variant="success" size="sm">Active</Badge>
              ) : (
                <Badge variant="danger" size="sm">Banned</Badge>
              )}
            </TD>
            <TD className="whitespace-nowrap text-ink-400">{formatDate(u.createdAt)}</TD>
            {canWrite ? (
              <TD>
                <div className="flex items-center justify-end gap-1">
                  {u.status === "active" ? (
                    <ConfirmSubmit
                      action={setUserStatusAction}
                      hidden={{ id: u.id, status: "banned" }}
                      title={`Ban ${u.name}?`}
                      description="They'll be signed out and blocked from logging in or registering until reinstated."
                      confirmLabel="Ban user"
                      trigger={
                        <button type="button" title="Ban" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-danger">
                          <Ban className="h-4 w-4" />
                        </button>
                      }
                    />
                  ) : (
                    <ConfirmSubmit
                      action={setUserStatusAction}
                      hidden={{ id: u.id, status: "active" }}
                      destructive={false}
                      title={`Reinstate ${u.name}?`}
                      description="They'll be able to log in and register again."
                      confirmLabel="Reinstate"
                      trigger={
                        <button type="button" title="Reinstate" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-teal">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      }
                    />
                  )}
                  <ConfirmSubmit
                    action={deleteUserAction}
                    hidden={{ id: u.id }}
                    title={`Delete ${u.name}?`}
                    description="This permanently removes the account and all of its registrations. This cannot be undone."
                    confirmLabel="Delete user"
                    trigger={
                      <button type="button" title="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-danger">
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
