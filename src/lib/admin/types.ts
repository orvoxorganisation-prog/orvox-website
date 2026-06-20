/** Admin domain types — mirror the admin tables in src/lib/db/schema.sql. */

export type AdminRole = "superadmin" | "admin" | "editor" | "viewer";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: "active" | "suspended";
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminSession {
  admin: AdminUser;
}

export interface AuditLogEntry {
  id: number;
  adminId: string | null;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  ip: string | null;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  alt: string;
  folder: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  position: number;
  published: boolean;
  updatedAt: string;
}

export interface NavItem {
  id: number;
  location: "header" | "footer";
  groupLabel: string;
  label: string;
  href: string;
  position: number;
  enabled: boolean;
}

export interface SiteFlag {
  key: string;
  label: string;
  grp: string;
  enabled: boolean;
  updatedAt: string;
}

export interface ContentBlock {
  key: string;
  grp: string;
  label: string;
  value: Record<string, unknown>;
  updatedAt: string;
  updatedBy: string | null;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  handle: string | null;
  school: string | null;
  city: string | null;
  status: "active" | "banned";
  createdAt: string;
  lastSeenAt: string | null;
  registrationCount: number;
}

export interface AdminRegistration {
  id: number;
  accountId: string | null;
  eventSlug: string;
  eventTitle: string | null;
  registeredAt: string;
  status: "confirmed" | "waitlist";
  fullName: string;
  email: string;
  phone: string | null;
  school: string;
  category: string | null;
  motivation: string | null;
}
