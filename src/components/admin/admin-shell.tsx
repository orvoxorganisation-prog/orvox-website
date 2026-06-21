"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  FileText,
  HelpCircle,
  ListTree,
  Megaphone,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  SlidersHorizontal,
  Settings,
  ScrollText,
  BarChart3,
  LogOut,
  ExternalLink,
  KeyRound,
  Menu,
  X,
} from "lucide-react";
import { can, ROLE_LABELS, type Permission } from "@/lib/admin/rbac";
import type { AdminRole } from "@/lib/admin/types";
import { adminLogout } from "@/app/admin/actions";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  perm: Permission;
  exact?: boolean;
}
interface NavSection {
  title: string;
  links: NavLink[];
}

const NAV: NavSection[] = [
  {
    title: "Overview",
    links: [
      { label: "Dashboard", href: "/admin", Icon: LayoutDashboard, perm: "analytics:read", exact: true },
      { label: "Analytics", href: "/admin/analytics", Icon: BarChart3, perm: "analytics:read" },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Events", href: "/admin/events", Icon: CalendarDays, perm: "events:read" },
      { label: "Registrations", href: "/admin/registrations", Icon: Ticket, perm: "registrations:read" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Pages & text", href: "/admin/content", Icon: FileText, perm: "content:read" },
      { label: "FAQs", href: "/admin/content/faqs", Icon: HelpCircle, perm: "content:read" },
      { label: "Navigation", href: "/admin/content/navigation", Icon: ListTree, perm: "content:read" },
      { label: "Announcements", href: "/admin/announcements", Icon: Megaphone, perm: "content:read" },
      { label: "Media", href: "/admin/media", Icon: ImageIcon, perm: "media:read" },
    ],
  },
  {
    title: "People",
    links: [
      { label: "Users", href: "/admin/users", Icon: Users, perm: "users:read" },
      { label: "Admins", href: "/admin/admins", Icon: ShieldCheck, perm: "admins:manage" },
    ],
  },
  {
    title: "Site",
    links: [
      { label: "Website controls", href: "/admin/controls", Icon: SlidersHorizontal, perm: "controls:write" },
      { label: "Settings", href: "/admin/settings", Icon: Settings, perm: "settings:read" },
      { label: "Audit log", href: "/admin/audit", Icon: ScrollText, perm: "audit:read" },
    ],
  },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string; role: AdminRole };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isActive = (link: NavLink) =>
    link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(link.href + "/");

  // Close the mobile drawer on navigation.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold tracking-tight text-ink-50">ORVOX</span>
          <span className="rounded bg-yellow/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-canvas lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV.map((section) => {
          const visible = section.links.filter((l) => can(admin.role, l.perm));
          if (visible.length === 0) return null;
          return (
            <div key={section.title}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">{section.title}</p>
              <ul className="space-y-0.5">
                {visible.map((link) => {
                  const active = isActive(link);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-white/[0.06] font-medium text-ink-50 ring-1 ring-inset ring-white/10"
                            : "text-ink-400 hover:bg-white/[0.03] hover:text-ink-100",
                        )}
                      >
                        <link.Icon
                          className={cn("h-4 w-4 shrink-0", active ? "text-yellow" : "text-ink-500 group-hover:text-ink-300")}
                          strokeWidth={1.75}
                        />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-3">
        <Link
          href="/admin/security"
          className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-400 hover:bg-white/[0.03] hover:text-ink-100"
        >
          <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
          My security · 2FA
        </Link>
        <Link
          href="/"
          target="_blank"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-400 hover:bg-white/[0.03] hover:text-ink-100"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          View live site
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 text-xs font-semibold text-teal">
            {initials(admin.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink-100">{admin.name}</p>
            <p className="truncate text-[11px] text-ink-500">{ROLE_LABELS[admin.role]}</p>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-danger"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-void">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/8 bg-stage lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/8 bg-stage">{sidebar}</aside>
        </div>
      ) : null}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/8 bg-void/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-ink-300 hover:bg-white/5 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-ink-500">
            <span className="hidden sm:inline">Signed in as</span>
            <span className="font-medium text-ink-300">{admin.email}</span>
          </div>
        </header>
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
