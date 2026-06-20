"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Menu, X, LogOut, ArrowLeft, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Accent } from "@/lib/data/types";

export interface NavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
  badge?: number;
}

interface AppShellProps {
  nav: NavItem[];
  user: { name: string; role: string; accent: Accent };
  notifications?: number;
  children: React.ReactNode;
}

const EASE = [0.32, 0.72, 0, 1] as const;

/** Mono console clock — renders after mount so SSR stays deterministic. */
function ConsoleClock() {
  const [time, setTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="hidden items-center gap-2 font-mono text-[12px] tabular tracking-[0.08em] text-ink-400 sm:inline-flex"
      suppressHydrationWarning
    >
      <span className="signal-lamp bg-teal" aria-hidden />
      {time ?? "--:--"} IST
    </span>
  );
}

/**
 * The broadcast console. Dark glass rail + thin topbar strip; content sits
 * as panels on the void. Same world as the marketing site, tuned for work.
 */
export function AppShell({ nav, user, notifications = 0, children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const NavLinks = ({ onNavigate, layoutId }: { onNavigate?: () => void; layoutId: string }) => (
    <nav className="flex flex-1 flex-col gap-0.5" aria-label="Dashboard">
      {nav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              active ? "text-canvas" : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-200",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-card bg-white/[0.07] ring-1 ring-inset ring-white/10"
                transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
              >
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-yellow" />
              </motion.span>
            )}
            <item.Icon
              className={cn(
                "relative h-4.5 w-4.5 shrink-0",
                active ? "text-yellow" : "text-ink-500 group-hover:text-ink-300",
              )}
              strokeWidth={1.75}
            />
            <span className="relative flex-1">{item.label}</span>
            {item.badge ? (
              <span
                className={cn(
                  "relative rounded-full px-2 py-0.5 font-mono text-[10px] tabular",
                  active ? "bg-yellow text-ink-900" : "bg-white/8 text-ink-300",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarFooter = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="mt-auto space-y-0.5 border-t border-white/8 pt-3">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-ink-400 transition-colors hover:bg-white/[0.04] hover:text-ink-200"
      >
        <ArrowLeft className="h-4.5 w-4.5 text-ink-500" strokeWidth={1.75} />
        Back to site
      </Link>
      <a
        href="/logout"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-ink-400 transition-colors hover:bg-white/[0.04] hover:text-ink-200"
      >
        <LogOut className="h-4.5 w-4.5 text-ink-500" strokeWidth={1.75} />
        Log out
      </a>
      <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
        {siteConfig.season} · {siteConfig.city}
      </p>
    </div>
  );

  return (
    <div className="void-mesh min-h-svh text-canvas">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-void/60 px-4 py-6 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <div className="mt-8 flex flex-1 flex-col">
          <NavLinks layoutId="rail-active" />
          <SidebarFooter />
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Topbar strip */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/8 bg-void/70 px-5 backdrop-blur-xl sm:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="press -ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-canvas lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="hidden lg:block">
            <ConsoleClock />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="press relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-300 ring-1 ring-inset ring-white/12 transition-colors hover:bg-white/5 hover:text-canvas"
              aria-label={`Notifications${notifications ? `, ${notifications} new` : ""}`}
            >
              <Bell className="h-4.5 w-4.5" strokeWidth={1.75} />
              {notifications > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-live px-1 font-mono text-[9px] font-semibold text-canvas">
                  {notifications}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2.5">
              <Avatar name={user.name} accent={user.accent} size={36} />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight tracking-tight text-canvas">{user.name}</p>
                <p className="text-[11px] leading-tight text-ink-400">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main id="main" className="px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial="hidden" animate="show" exit="hidden">
            <motion.div
              className="absolute inset-0 bg-void/60 backdrop-blur-sm"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-white/10 bg-surface px-4 py-6"
              variants={{ hidden: { x: reduce ? 0 : "-100%" }, show: { x: 0 } }}
              transition={{ duration: 0.36, ease: EASE }}
            >
              <div className="flex items-center justify-between px-2">
                <Logo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="press inline-flex h-9 w-9 items-center justify-center rounded-full text-canvas"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <div className="mt-8 flex flex-1 flex-col">
                <NavLinks onNavigate={() => setOpen(false)} layoutId="drawer-active" />
                <SidebarFooter onNavigate={() => setOpen(false)} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
