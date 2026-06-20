import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* Shared presentational primitives for the admin control panel. Server-safe
   (no client hooks) so they compose freely inside server components. */

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-50">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-ink-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl bg-surface ring-1 ring-inset ring-white/10", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-ink-100">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-ink-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: "default" | "yellow" | "teal" | "rose" | "danger";
}) {
  const accentText = {
    default: "text-ink-50",
    yellow: "text-yellow",
    teal: "text-teal",
    rose: "text-rose-deep",
    danger: "text-danger",
  }[accent];
  return (
    <Panel className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className={cn("mt-2 font-mono text-3xl font-semibold tabular-nums", accentText)}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink-400">{sub}</p> : null}
    </Panel>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink-200">{title}</p>
      {description ? <p className="max-w-sm text-sm text-ink-400">{description}</p> : null}
      {action}
    </div>
  );
}

/* ---- Table primitives --------------------------------------------------- */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-ink-400">
      {children}
    </thead>
  );
}

export function TH({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap px-4 py-3 font-medium", className)}>{children}</th>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-white/6 last:border-0 hover:bg-white/[0.02]", className)}>{children}</tr>;
}

export function TD({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-ink-200", className)}>{children}</td>;
}

/* ---- Small link button (server-safe) ------------------------------------ */
export function LinkButton({
  href,
  children,
  variant = "ghost",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "yellow";
  className?: string;
}) {
  const styles = {
    primary: "bg-canvas text-ink-900 hover:bg-ink-100",
    yellow: "bg-gradient-to-b from-yellow to-yellow-deep text-ink-900 hover:brightness-105",
    ghost: "ring-1 ring-inset ring-white/15 text-ink-200 hover:bg-white/5 hover:text-canvas",
  }[variant];
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors",
        styles,
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ---- Field group for forms ---------------------------------------------- */
export function FormField({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink-300">
        {label}
        {required ? <span className="ml-0.5 text-yellow">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
