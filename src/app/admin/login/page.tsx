import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/admin/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  // Already authenticated → straight to the dashboard.
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-ink-50">ORVOX</span>
            <span className="rounded bg-yellow/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow">
              Admin
            </span>
          </div>
          <h1 className="text-lg font-semibold text-ink-100">Control room access</h1>
          <p className="mt-1 text-sm text-ink-400">Sign in to manage events, content, and users.</p>
        </div>

        <div className="rounded-2xl bg-surface p-6 ring-1 ring-inset ring-white/10 sm:p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
