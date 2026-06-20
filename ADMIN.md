# ORVOX Admin Control Panel

A secure, role-based admin system at **`/admin`**, fully separate from the public
site, backed by Neon Postgres.

## Access

- Login: `/admin/login`
- The area is gated by `src/proxy.ts` (Next.js 16 Proxy — optimistic cookie
  check) plus a database-backed Data Access Layer (`src/lib/admin/dal.ts`) that
  validates the session and enforces role permissions on every page and action.

## Roles (RBAC)

| Role | Capability |
| --- | --- |
| `superadmin` | Everything, including managing other admins |
| `admin` | Everything except admin-user management |
| `editor` | Events, content, media, registrations, website controls |
| `viewer` | Read-only |

Permissions are defined in `src/lib/admin/rbac.ts`.

## Modules

- **Dashboard / Analytics** — users, registrations, events, conversion, seat-fill, trends.
- **Events** — create, edit, delete, duplicate, draft/publish, feature, bulk actions, schedule editor.
- **Registrations** — view, filter, status changes, CSV export, per-event analytics.
- **Content** — editable page text blocks, FAQs, header/footer navigation.
- **Announcements** — site-wide wire feed.
- **Media** — upload (Vercel Blob) or add-by-URL, organize, delete.
- **Users** — view participants, ban/reinstate, delete.
- **Admins** — manage admin accounts and roles (superadmin only).
- **Website controls** — toggle homepage sections, page visibility, banners, featured events.
- **Settings** — site, SEO, social, contact, email templates.
- **Audit log** — every admin mutation is recorded (who/what/when/IP).

## Security

- Passwords hashed with Node `scrypt` (no native deps; Vercel-safe).
- Sessions are opaque random tokens; only the SHA-256 hash is stored in the DB.
- httpOnly + Secure + SameSite cookies, 12-hour expiry.
- All inputs validated server-side with Zod (`src/lib/admin/validation.ts`).
- Every mutation re-checks permission server-side and writes an audit entry.

## Database

Schema: `src/lib/db/schema.sql` (public + admin tables).

```bash
node scripts/migrate.mjs          # apply schema (idempotent)
node scripts/seed.mjs             # seed events/resources/settings/nav/FAQs from src/lib/data
node scripts/create-admin.mjs <email> <name> [password] [role]   # bootstrap an admin
```

Scripts read `DATABASE_URL` from `.env.local`.

## Deployment (Vercel)

1. Set `DATABASE_URL` and `SESSION_SECRET` env vars.
2. (Optional) Add a Vercel Blob store to enable Media uploads.
3. Deploy. Run the migrate/seed/create-admin scripts once against the Neon DB.
