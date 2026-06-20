import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · ORVOX Admin" },
  // The admin area must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-void text-ink-100">{children}</div>;
}
