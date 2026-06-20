import Link from "next/link";
import { requirePermission } from "@/lib/admin/dal";
import { getAuditLogs } from "@/lib/admin/audit";
import { AdminPageHeader, Panel, Table, THead, TH, TR, TD, EmptyState } from "@/components/admin/ui";
import { SearchInput } from "@/components/admin/toolbar";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Audit log" };

const PAGE_SIZE = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requirePermission("audit:read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { rows, total } = await getAuditLogs({ search: sp.q, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const mkHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    params.set("page", String(p));
    return `/admin/audit?${params.toString()}`;
  };

  return (
    <>
      <AdminPageHeader title="Audit log" description={`${total} recorded action${total === 1 ? "" : "s"}. Every admin change is logged.`} />

      <div className="mb-4">
        <SearchInput placeholder="Search actions, admins…" />
      </div>

      <Panel className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title="No log entries" description="Admin actions will appear here." />
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>When</TH>
                <TH>Admin</TH>
                <TH>Action</TH>
                <TH>Entity</TH>
                <TH>Summary</TH>
                <TH>IP</TH>
              </TR>
            </THead>
            <tbody>
              {rows.map((log) => (
                <TR key={log.id}>
                  <TD className="whitespace-nowrap text-ink-400">{new Date(log.createdAt).toLocaleString("en-IN")}</TD>
                  <TD className="text-ink-300">{log.adminEmail}</TD>
                  <TD><Badge variant="ghost" size="sm">{log.action}</Badge></TD>
                  <TD className="text-ink-400">{log.entityType}{log.entityId ? ` · ${log.entityId}` : ""}</TD>
                  <TD className="text-ink-200">{log.summary}</TD>
                  <TD className="font-mono text-xs text-ink-500">{log.ip ?? "—"}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-400">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 ? <Link href={mkHref(page - 1)} className="rounded-full px-3 py-1.5 ring-1 ring-inset ring-white/15 hover:bg-white/5">Previous</Link> : null}
            {page < pages ? <Link href={mkHref(page + 1)} className="rounded-full px-3 py-1.5 ring-1 ring-inset ring-white/15 hover:bg-white/5">Next</Link> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
