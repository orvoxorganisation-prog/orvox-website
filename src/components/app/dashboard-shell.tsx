"use client";

import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  BookOpen,
  Medal,
  Award,
  User,
  Settings,
} from "lucide-react";
import { AppShell, type NavItem } from "./app-shell";
import type { Accent } from "@/lib/data/types";

const nav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Events", href: "/dashboard/events", Icon: CalendarDays },
  { label: "My registrations", href: "/dashboard/registrations", Icon: Ticket },
  { label: "Resources", href: "/dashboard/resources", Icon: BookOpen },
  { label: "Results", href: "/dashboard/results", Icon: Medal },
  { label: "Achievements", href: "/dashboard/achievements", Icon: Award },
  { label: "Profile", href: "/dashboard/profile", Icon: User },
  { label: "Settings", href: "/dashboard/settings", Icon: Settings },
];

export function DashboardShell({
  user,
  notifications,
  children,
}: {
  user: { name: string; role: string; accent: Accent };
  notifications?: number;
  children: React.ReactNode;
}) {
  return (
    <AppShell nav={nav} user={user} notifications={notifications}>
      {children}
    </AppShell>
  );
}
