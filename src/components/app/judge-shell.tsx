"use client";

import { Gavel, ClipboardList, MessageSquareText, User } from "lucide-react";
import { AppShell, type NavItem } from "./app-shell";
import type { Accent } from "@/lib/data/types";

const nav: NavItem[] = [
  { label: "Assigned rounds", href: "/judge", Icon: Gavel },
  { label: "Evaluations", href: "/judge/evaluations", Icon: ClipboardList },
  { label: "Feedback history", href: "/judge/feedback", Icon: MessageSquareText },
  { label: "Profile", href: "/judge/profile", Icon: User },
];

export function JudgeShell({
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
