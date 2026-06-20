"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import { Upload, Link2, Trash2, Pencil, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel, FormField, EmptyState } from "@/components/admin/ui";
import { SubmitButton, ConfirmSubmit } from "@/components/admin/actions-ui";
import { formatDate } from "@/lib/utils";
import type { MediaItem } from "@/lib/admin/types";
import { addMediaByUrlAction, updateMediaAction, deleteMediaAction, type MediaResult } from "./actions";

export function MediaLibrary({ items, canDelete }: { items: MediaItem[]; canDelete: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <UploadCard />
        <UrlCard />
      </div>

      {items.length === 0 ? (
        <Panel>
          <EmptyState title="No media yet" description="Upload an image or add one by URL to start your library." />
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <MediaCard key={m.id} item={m} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadCard() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [folder, setFolder] = React.useState("general");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await fetch("/admin/media/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok) {
        toast.success("Uploaded");
        router.refresh();
      } else {
        toast.error(json.error ?? "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <Panel className="p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100">
        <Upload className="h-4 w-4 text-yellow" /> Upload image
      </h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <FormField label="Folder">
          <Input value={folder} onChange={(e) => setFolder(e.target.value)} className="h-10" />
        </FormField>
        <div className="flex items-end">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-canvas px-4 text-[13px] font-medium text-ink-900 hover:bg-ink-100">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? "Uploading…" : "Choose file"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
          </label>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-500">Images up to 10 MB. Requires Vercel Blob storage.</p>
    </Panel>
  );
}

function UrlCard() {
  const [state, formAction] = useActionState<MediaResult, FormData>(addMediaByUrlAction, { ok: false });
  const ref = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (state.ok) {
      toast.success("Media added");
      ref.current?.reset();
    } else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Panel className="p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100">
        <Link2 className="h-4 w-4 text-teal" /> Add by URL
      </h2>
      <form ref={ref} action={formAction} className="grid gap-3 sm:grid-cols-2">
        <FormField label="Image URL" className="sm:col-span-2" required>
          <Input name="url" type="url" placeholder="https://…" required className="h-10" />
        </FormField>
        <FormField label="Filename" required>
          <Input name="filename" placeholder="hero.jpg" required className="h-10" />
        </FormField>
        <FormField label="Folder">
          <Input name="folder" defaultValue="general" className="h-10" />
        </FormField>
        <FormField label="Alt text" className="sm:col-span-2">
          <Input name="alt" className="h-10" />
        </FormField>
        <div className="sm:col-span-2">
          <SubmitButton variant="ghost" size="sm" pendingLabel="Adding…">Add to library</SubmitButton>
        </div>
      </form>
    </Panel>
  );
}

function MediaCard({ item, canDelete }: { item: MediaItem; canDelete: boolean }) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-surface ring-1 ring-inset ring-white/10">
      <div className="aspect-square overflow-hidden bg-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt || item.filename} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-medium text-ink-100" title={item.filename}>{item.filename}</p>
        <p className="text-[11px] text-ink-500">{item.folder} · {formatDate(item.createdAt)}</p>
        <div className="mt-2 flex items-center gap-1">
          <EditDialog item={item} />
          {canDelete ? (
            <ConfirmSubmit
              action={deleteMediaAction}
              hidden={{ id: item.id }}
              title={`Delete “${item.filename}”?`}
              description="This removes it from the library (and Blob storage if applicable)."
              confirmLabel="Delete"
              trigger={
                <button type="button" title="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EditDialog({ item }: { item: MediaItem }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-canvas">
          <Pencil className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface-2 p-6 ring-1 ring-inset ring-white/12 motion-safe:animate-pop-in">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-ink-50">Edit media</Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1 text-ink-400 hover:bg-white/5" aria-label="Close"><X className="h-4 w-4" /></button>
            </Dialog.Close>
          </div>
          <form action={updateMediaAction} onSubmit={() => setOpen(false)} className="space-y-4">
            <input type="hidden" name="id" value={item.id} />
            <FormField label="Alt text"><Input name="alt" defaultValue={item.alt} /></FormField>
            <FormField label="Folder"><Input name="folder" defaultValue={item.folder} /></FormField>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild><Button variant="ghost" size="sm">Cancel</Button></Dialog.Close>
              <SubmitButton variant="yellow" size="sm">Save</SubmitButton>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
