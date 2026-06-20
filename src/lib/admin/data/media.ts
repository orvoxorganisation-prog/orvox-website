import "server-only";
import { requireSql } from "@/lib/db/client";
import type { MediaItem } from "../types";

function rowToMedia(r: Record<string, unknown>): MediaItem {
  return {
    id: r.id as string,
    filename: r.filename as string,
    url: r.url as string,
    alt: (r.alt as string) ?? "",
    folder: (r.folder as string) ?? "general",
    mime: (r.mime as string) ?? "",
    sizeBytes: Number(r.size_bytes ?? 0),
    width: r.width == null ? null : Number(r.width),
    height: r.height == null ? null : Number(r.height),
    uploadedBy: (r.uploaded_by as string) ?? null,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  };
}

export async function listMedia(filter: { folder?: string | null; search?: string | null } = {}): Promise<MediaItem[]> {
  const sql = requireSql();
  const folder = filter.folder ?? null;
  const search = filter.search ? `%${filter.search}%` : null;
  const rows = (await sql`
    select * from media
    where (${folder}::text is null or folder = ${folder})
      and (${search}::text is null or filename ilike ${search} or alt ilike ${search})
    order by created_at desc
  `) as Array<Record<string, unknown>>;
  return rows.map(rowToMedia);
}

export async function listFolders(): Promise<Array<{ folder: string; count: number }>> {
  const rows = (await requireSql()`select folder, count(*)::int as count from media group by folder order by folder`) as Array<{ folder: string; count: number }>;
  return rows;
}

export async function createMedia(input: { id: string; filename: string; url: string; alt: string; folder: string; mime: string; sizeBytes: number; width?: number | null; height?: number | null; uploadedBy: string | null }): Promise<void> {
  await requireSql()`
    insert into media (id, filename, url, alt, folder, mime, size_bytes, width, height, uploaded_by)
    values (${input.id}, ${input.filename}, ${input.url}, ${input.alt}, ${input.folder}, ${input.mime}, ${input.sizeBytes}, ${input.width ?? null}, ${input.height ?? null}, ${input.uploadedBy})
  `;
}

export async function updateMedia(mediaId: string, input: { alt: string; folder: string }): Promise<void> {
  await requireSql()`update media set alt = ${input.alt}, folder = ${input.folder} where id = ${mediaId}`;
}

export async function getMedia(mediaId: string): Promise<MediaItem | null> {
  const rows = (await requireSql()`select * from media where id = ${mediaId} limit 1`) as Array<Record<string, unknown>>;
  return rows[0] ? rowToMedia(rows[0]) : null;
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await requireSql()`delete from media where id = ${mediaId}`;
}
