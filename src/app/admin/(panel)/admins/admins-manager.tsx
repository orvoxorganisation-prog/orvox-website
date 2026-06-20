"use client";

import * as React from "react";
import { useActionState } from "react";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import { UserPlus, Pencil, Ban, RotateCcw, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD, FormField } from "@/components/admin/ui";
import { SubmitButton, ConfirmSubmit, ActionForm } from "@/components/admin/actions-ui";
import { ROLE_LABELS } from "@/lib/admin/rbac";
import { formatDate } from "@/lib/utils";
import type { AdminUser, AdminRole } from "@/lib/admin/types";
import { createAdminAction, updateAdminAction, setAdminStatusAction, deleteAdminAction, type AdminFormResult } from "./actions";

const ROLES = ["superadmin", "admin", "editor", "viewer"];

function RoleSelect({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue ?? "editor");
  const labels = ROLES.map((r) => ROLE_LABELS[r as AdminRole]);
  const labelToRole = new Map(ROLES.map((r) => [ROLE_LABELS[r as AdminRole], r]));
  return (
    <>
      <input type="hidden" name="role" value={value} />
      <SelectField
        value={ROLE_LABELS[value as AdminRole]}
        onValueChange={(label) => setValue(labelToRole.get(label) ?? "editor")}
        options={labels}
      />
    </>
  );
}

export function AdminsManager({ admins, currentId }: { admins: AdminUser[]; currentId: string }) {
  return (
    <div className="space-y-6">
      <CreateForm />
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-inset ring-white/10">
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Admin</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH>Last login</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {admins.map((a) => (
              <TR key={a.id}>
                <TD>
                  <p className="font-medium text-ink-100">
                    {a.name} {a.id === currentId ? <span className="text-xs text-ink-500">(you)</span> : null}
                  </p>
                  <p className="text-xs text-ink-500">{a.email}</p>
                </TD>
                <TD>
                  <Badge variant={a.role === "superadmin" ? "yellow" : a.role === "viewer" ? "muted" : "teal"} size="sm">
                    {ROLE_LABELS[a.role]}
                  </Badge>
                </TD>
                <TD>
                  {a.status === "active" ? (
                    <Badge variant="success" size="sm">Active</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Suspended</Badge>
                  )}
                </TD>
                <TD className="whitespace-nowrap text-ink-400">{a.lastLoginAt ? formatDate(a.lastLoginAt) : "Never"}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1">
                    <EditDialog admin={a} />
                    {a.id !== currentId ? (
                      <>
                        {a.status === "active" ? (
                          <ActionForm action={setAdminStatusAction} hidden={{ id: a.id, status: "suspended" }}>
                            <IconBtn title="Suspend"><Ban className="h-4 w-4" /></IconBtn>
                          </ActionForm>
                        ) : (
                          <ActionForm action={setAdminStatusAction} hidden={{ id: a.id, status: "active" }}>
                            <IconBtn title="Activate"><RotateCcw className="h-4 w-4" /></IconBtn>
                          </ActionForm>
                        )}
                        <ConfirmSubmit
                          action={deleteAdminAction}
                          hidden={{ id: a.id }}
                          title={`Delete admin ${a.email}?`}
                          description="This removes their access immediately. This cannot be undone."
                          confirmLabel="Delete admin"
                          trigger={<IconBtn title="Delete" danger><Trash2 className="h-4 w-4" /></IconBtn>}
                        />
                      </>
                    ) : null}
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function CreateForm() {
  const [state, formAction] = useActionState<AdminFormResult, FormData>(createAdminAction, { ok: false });
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (state.ok) {
      toast.success("Admin created");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-inset ring-white/10">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-100">
        <UserPlus className="h-4 w-4 text-yellow" /> Add an admin
      </h2>
      <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Name" required>
          <Input name="name" required placeholder="Jane Doe" />
        </FormField>
        <FormField label="Email" required>
          <Input name="email" type="email" required placeholder="jane@orvox.in" />
        </FormField>
        <FormField label="Role">
          <RoleSelect />
        </FormField>
        <FormField label="Temp password" required hint="At least 10 characters.">
          <Input name="password" type="text" required placeholder="••••••••••" />
        </FormField>
        <div className="sm:col-span-2 lg:col-span-4">
          <SubmitButton variant="yellow" pendingLabel="Creating…">Create admin</SubmitButton>
        </div>
      </form>
    </div>
  );
}

function EditDialog({ admin }: { admin: AdminUser }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<AdminFormResult, FormData>(updateAdminAction, { ok: false });
  React.useEffect(() => {
    if (state.ok) {
      toast.success("Admin updated");
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconBtn title="Edit"><Pencil className="h-4 w-4" /></IconBtn>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface-2 p-6 ring-1 ring-inset ring-white/12 motion-safe:animate-pop-in">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-ink-50">Edit {admin.email}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1 text-ink-400 hover:bg-white/5 hover:text-canvas" aria-label="Close"><X className="h-4 w-4" /></button>
            </Dialog.Close>
          </div>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={admin.id} />
            <FormField label="Name" required>
              <Input name="name" defaultValue={admin.name} required />
            </FormField>
            <FormField label="Role">
              <RoleSelect defaultValue={admin.role} />
            </FormField>
            <FormField label="Reset password" hint="Leave blank to keep the current password.">
              <Input name="password" type="text" placeholder="New password (optional)" />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm">Cancel</Button>
              </Dialog.Close>
              <SubmitButton variant="yellow" size="sm" pendingLabel="Saving…">Save</SubmitButton>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const IconBtn = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { title: string; danger?: boolean }
>(({ children, title, danger, className, type, ...props }, ref) => (
  <button
    ref={ref}
    type={type ?? "submit"}
    title={title}
    aria-label={title}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 ${danger ? "hover:text-danger" : "hover:text-canvas"} ${className ?? ""}`}
    {...props}
  >
    {children}
  </button>
));
IconBtn.displayName = "IconBtn";
