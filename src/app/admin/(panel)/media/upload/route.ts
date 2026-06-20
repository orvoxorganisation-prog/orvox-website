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
  const folder = String(form.get("folder") || "general");
  if (!(file instanceof File)) return Response.json({ ok: false, error: "No file provided." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ ok: false, error: "Max file size is 10 MB." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ ok: false, error: "Only images are allowed." }, { status: 400 });

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
