import { getCurrentAdmin } from "@/lib/admin/dal";
import { can } from "@/lib/admin/rbac";
import { createMedia } from "@/lib/admin/data/media";
import { logAudit } from "@/lib/admin/audit";
import { id as genId } from "@/lib/admin/util";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can(admin.role, "media:write")) return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { ok: false, error: "File uploads need Vercel Blob. Add a Blob store in Vercel (sets BLOB_READ_WRITE_TOKEN), or add media by URL." },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  // Sanitise folder to a flat, traversal-safe segment (no "/", "..", etc.).
  const folder = (String(form.get("folder") || "general").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80)) || "general";
  if (!(file instanceof File)) return Response.json({ ok: false, error: "No file provided." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ ok: false, error: "Max file size is 10 MB." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ ok: false, error: "Only images are allowed." }, { status: 400 });

  // The browser-supplied MIME is spoofable — verify real image magic bytes.
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const isImage =
    (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) || // JPEG
    (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) || // PNG
    (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) || // GIF
    (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 && head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50); // WEBP
  // SVG is intentionally excluded — it can carry scripts and is served publicly.
  if (!isImage) return Response.json({ ok: false, error: "That file isn't a valid raster image (JPEG, PNG, GIF, WebP)." }, { status: 400 });

  try {
    const { put } = await import("@vercel/blob");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const blob = await put(`media/${folder}/${Date.now()}-${safeName}`, file, { access: "public" });
    const mediaId = genId("med");
    await createMedia({
      id: mediaId,
      filename: file.name,
      url: blob.url,
      alt: "",
      folder,
      mime: file.type,
      sizeBytes: file.size,
      uploadedBy: admin.email,
    });
    await logAudit({ admin, action: "create", entityType: "media", entityId: mediaId, summary: `Uploaded “${file.name}”` });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("upload failed:", err);
    return Response.json({ ok: false, error: "Upload failed. Try again." }, { status: 500 });
  }
}
