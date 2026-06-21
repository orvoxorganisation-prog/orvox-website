import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db/client";
import { dbExportAccountData } from "@/lib/db/public";

export const dynamic = "force-dynamic";

/** GDPR data export: returns everything tied to the signed-in account as JSON. */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  let data: unknown = { session };
  if (isDbConfigured) {
    try {
      const { account, registrations } = await dbExportAccountData(session.email);
      data = { exportedAt: new Date().toISOString(), session, account, registrations };
    } catch (err) {
      console.error("data export failed:", err);
      return new Response("Export failed", { status: 500 });
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="orvox-my-data-${stamp}.json"`,
    },
  });
}
