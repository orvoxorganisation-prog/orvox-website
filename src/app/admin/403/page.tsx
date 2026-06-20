import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/12 text-danger ring-1 ring-inset ring-danger/30">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-mono text-3xl font-bold text-ink-50">403 · No clearance</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-400">
        Your account doesn&apos;t have permission to view this area. Ask a super admin if you think this is a mistake.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-flex h-10 items-center rounded-full bg-canvas px-5 text-sm font-medium text-ink-900 hover:bg-ink-100"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
