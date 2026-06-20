import type { AdminRole } from "./types";

/**
 * Role-based access control. Permissions are coarse capabilities; each admin
 * route/action checks one. `superadmin` implicitly has every permission.
 */
export type Permission =
  | "analytics:read"
  | "events:read"
  | "events:write"
  | "events:delete"
  | "registrations:read"
  | "registrations:write"
  | "registrations:export"
  | "content:read"
  | "content:write"
  | "media:read"
  | "media:write"
  | "media:delete"
  | "users:read"
  | "users:write"
  | "settings:read"
  | "settings:write"
  | "controls:write"
  | "audit:read"
  | "admins:manage";

const READ_ONLY: Permission[] = [
  "analytics:read",
  "events:read",
  "registrations:read",
  "content:read",
  "media:read",
  "users:read",
  "settings:read",
  "audit:read",
];

const EDITOR: Permission[] = [
  ...READ_ONLY,
  "events:write",
  "registrations:write",
  "registrations:export",
  "content:write",
  "media:write",
  "media:delete",
  "controls:write",
];

const ADMIN: Permission[] = [
  ...EDITOR,
  "events:delete",
  "users:write",
  "settings:write",
];

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[] | "*"> = {
  superadmin: "*",
  admin: ADMIN,
  editor: EDITOR,
  viewer: READ_ONLY,
};

export function can(role: AdminRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms === "*") return true;
  return perms.includes(permission);
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Super admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_RANK: Record<AdminRole, number> = {
  superadmin: 3,
  admin: 2,
  editor: 1,
  viewer: 0,
};
