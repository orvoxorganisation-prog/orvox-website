-- ============================================================================
-- ORVOX · Postgres schema (Neon-ready)
-- Authoritative schema for the public site AND the admin control panel.
-- Mirrors src/lib/data/types.ts (public) + src/lib/admin/types.ts (admin).
-- Apply with:  node scripts/migrate.mjs   (idempotent runner)
-- or:          psql "$DATABASE_URL" -f src/lib/db/schema.sql   (fresh DB only)
-- ============================================================================

-- ---- Enums --------------------------------------------------------------
do $$ begin create type track as enum ('debate', 'pitch', 'speaking', 'oped'); exception when duplicate_object then null; end $$;
do $$ begin create type accent as enum ('yellow', 'teal', 'rose', 'stage'); exception when duplicate_object then null; end $$;
do $$ begin create type event_status as enum ('open', 'closing-soon', 'live', 'upcoming', 'closed'); exception when duplicate_object then null; end $$;
do $$ begin create type event_mode as enum ('Online', 'On-site', 'Hybrid'); exception when duplicate_object then null; end $$;
do $$ begin create type standing_status as enum ('champion', 'advanced', 'eliminated'); exception when duplicate_object then null; end $$;
do $$ begin create type registration_status as enum ('confirmed', 'waitlist'); exception when duplicate_object then null; end $$;
do $$ begin create type round_status as enum ('assigned', 'scoring', 'submitted'); exception when duplicate_object then null; end $$;
do $$ begin create type admin_role as enum ('superadmin', 'admin', 'editor', 'viewer'); exception when duplicate_object then null; end $$;

-- ---- Public: events -----------------------------------------------------
create table if not exists events (
  id                     text primary key,
  slug                   text unique not null,
  title                  text not null,
  subtitle               text not null default '',
  season                 text not null default 'S03',
  track                  track not null,
  accent                 accent not null default 'yellow',
  status                 event_status not null default 'open',
  format                 text not null default '',
  mode                   event_mode not null default 'Online',
  venue                  text not null default '',
  city                   text not null default '',
  start_date             timestamptz not null,
  end_date               timestamptz not null,
  registration_deadline  timestamptz not null,
  eligibility            text not null default '',
  seats_total            integer not null default 0 check (seats_total >= 0),
  seats_filled           integer not null default 0 check (seats_filled >= 0),
  prize_pool             integer,
  hero_stat_value        text not null default '',
  hero_stat_label        text not null default '',
  summary                text not null default '',
  about                  text[] not null default '{}',
  rules                  text[] not null default '{}',
  eligibility_details    text[] not null default '{}',
  contact_name           text not null default '',
  contact_role           text not null default '',
  contact_email          text not null default '',
  tags                   text[] not null default '{}',
  published              boolean not null default true,   -- draft/publish
  featured               boolean not null default false,  -- feature/unfeature
  sort_order             integer not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists schedule_rounds (
  id         bigint generated always as identity primary key,
  event_id   text not null references events(id) on delete cascade,
  position   integer not null,
  label      text not null,
  date       timestamptz not null,
  detail     text not null default ''
);
create index if not exists schedule_rounds_event_idx on schedule_rounds (event_id, position);

-- ---- Public: resources --------------------------------------------------
create table if not exists resources (
  id          text primary key,
  slug        text unique not null,
  title       text not null,
  type        text not null,
  track       track not null,
  accent      accent not null default 'teal',
  description text not null default '',
  author      text not null default 'ORVOX coaching staff',
  minutes     integer not null default 5,
  updated_at  timestamptz not null default now(),
  featured    boolean not null default false,
  published   boolean not null default true
);

-- ---- Public: results ----------------------------------------------------
create table if not exists result_sets (
  id          bigint generated always as identity primary key,
  event_slug  text not null,
  event_title text not null,
  season      text not null,
  round_label text not null,
  decided_at  timestamptz not null,
  motion      text not null default '',
  published   boolean not null default true
);

create table if not exists standings (
  id            bigint generated always as identity primary key,
  result_set_id bigint not null references result_sets(id) on delete cascade,
  rank          integer not null,
  team          text not null,
  members       text[] not null default '{}',
  school        text not null default '',
  score         numeric(5,1) not null default 0,
  status        standing_status not null default 'advanced'
);

create table if not exists judge_notes (
  id            bigint generated always as identity primary key,
  result_set_id bigint not null references result_sets(id) on delete cascade,
  by_name       text not null,
  role          text not null default '',
  points        text[] not null default '{}'
);

-- ---- Public: accounts (competitors) + registrations ---------------------
create table if not exists accounts (
  id            text primary key,
  name          text not null,
  email         text unique not null,
  handle        text,
  school        text,
  city          text,
  joined_season text not null default 'S03',
  avatar_accent accent not null default 'teal',
  status        text not null default 'active',   -- active | banned
  password_hash text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz
);

create table if not exists registrations (
  id            bigint generated always as identity primary key,
  account_id    text references accounts(id) on delete cascade,
  event_slug    text not null,
  registered_at timestamptz not null default now(),
  status        registration_status not null default 'confirmed',
  full_name     text not null,
  email         text not null,
  phone         text,
  school        text not null default '',
  category      text,
  motivation    text,
  unique (account_id, event_slug)
);
create index if not exists registrations_event_idx on registrations (event_slug);
create index if not exists registrations_email_idx on registrations (email);

-- ---- Public: announcements (admin-managed wire feed) --------------------
create table if not exists announcements (
  id         text primary key,
  account_id text references accounts(id) on delete cascade,
  type       text not null default 'reminder',
  title      text not null,
  body       text not null default '',
  date       timestamptz not null default now(),
  href       text,
  published  boolean not null default true
);

-- ---- Public: judges -----------------------------------------------------
create table if not exists judges (
  id            text primary key,
  name          text not null,
  handle        text unique not null,
  accreditation text not null default '',
  rounds_judged integer not null default 0
);

create table if not exists judge_rounds (
  id            text primary key,
  judge_id      text references judges(id) on delete set null,
  event_title   text not null,
  season        text not null,
  round_label   text not null,
  room          text not null,
  motion        text not null,
  starts_at     timestamptz not null,
  status        round_status not null default 'assigned',
  team_a_name   text not null,
  team_a_school text not null,
  team_b_name   text not null,
  team_b_school text not null
);

create table if not exists evaluations (
  id             bigint generated always as identity primary key,
  judge_round_id text not null references judge_rounds(id) on delete cascade,
  team           text not null,
  content        integer not null check (content between 1 and 5),
  style          integer not null check (style between 1 and 5),
  strategy       integer not null check (strategy between 1 and 5),
  impact         integer not null check (impact between 1 and 5),
  feedback       text,
  submitted_at   timestamptz not null default now()
);

-- ============================================================================
-- ADMIN CONTROL PANEL
-- ============================================================================

-- ---- Admin users + RBAC -------------------------------------------------
create table if not exists admin_users (
  id            text primary key,
  email         text unique not null,
  name          text not null,
  password_hash text not null,
  role          admin_role not null default 'editor',
  status        text not null default 'active',  -- active | suspended
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---- Admin sessions (opaque token, hashed at rest) ----------------------
create table if not exists admin_sessions (
  id         text primary key,           -- sha256(token)
  admin_id   text not null references admin_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ip         text,
  user_agent text
);
create index if not exists admin_sessions_admin_idx on admin_sessions (admin_id);
create index if not exists admin_sessions_expires_idx on admin_sessions (expires_at);

-- ---- Audit log ----------------------------------------------------------
create table if not exists audit_logs (
  id          bigint generated always as identity primary key,
  admin_id    text,
  admin_email text not null default 'system',
  action      text not null,             -- create | update | delete | publish | login | ...
  entity_type text not null,             -- event | account | setting | media | ...
  entity_id   text,
  summary     text not null default '',
  metadata    jsonb not null default '{}',
  ip          text,
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);
create index if not exists audit_logs_entity_idx on audit_logs (entity_type, entity_id);

-- ---- Editable content blocks (landing sections, about, contact, etc.) ---
create table if not exists content_blocks (
  key        text primary key,           -- e.g. 'home.hero', 'about.manifesto'
  grp        text not null default 'general',
  label      text not null default '',
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by text
);

-- ---- Key/value site settings (site, seo, social, contact, email) --------
create table if not exists site_settings (
  key        text primary key,           -- 'site' | 'seo' | 'social' | 'contact' | 'email_templates'
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by text
);

-- ---- Feature flags / section + page visibility toggles ------------------
create table if not exists site_flags (
  key        text primary key,           -- 'section:proof', 'page:resources', ...
  label      text not null default '',
  grp        text not null default 'section',
  enabled    boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---- FAQs ---------------------------------------------------------------
create table if not exists faqs (
  id         bigint generated always as identity primary key,
  question   text not null,
  answer     text not null,
  category   text not null default 'General',
  position   integer not null default 0,
  published  boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---- Navigation menus (header + footer) ---------------------------------
create table if not exists nav_items (
  id          bigint generated always as identity primary key,
  location    text not null default 'header',  -- header | footer
  group_label text not null default '',         -- footer column heading
  label       text not null,
  href        text not null,
  position    integer not null default 0,
  enabled     boolean not null default true
);
create index if not exists nav_items_loc_idx on nav_items (location, position);

-- ---- Media library ------------------------------------------------------
create table if not exists media (
  id          text primary key,
  filename    text not null,
  url         text not null,
  alt         text not null default '',
  folder      text not null default 'general',
  mime        text not null default '',
  size_bytes  integer not null default 0,
  width       integer,
  height      integer,
  uploaded_by text,
  created_at  timestamptz not null default now()
);
create index if not exists media_folder_idx on media (folder);

-- ============================================================================
-- SECURITY / AUTH HARDENING (added by security audit)
-- All statements below are idempotent so the migrate runner can re-apply them.
-- ============================================================================

-- ---- Admin MFA (TOTP) ---------------------------------------------------
alter table admin_users add column if not exists mfa_secret  text;
alter table admin_users add column if not exists mfa_enabled boolean not null default false;

-- ---- Participant email verification ------------------------------------
alter table accounts add column if not exists email_verified boolean not null default false;

-- ---- One-time auth tokens (email verification + password reset) ---------
-- Only the SHA-256 hash of each token is stored, so a leaked row can't be used.
create table if not exists auth_tokens (
  id          bigint generated always as identity primary key,
  purpose     text not null,                 -- 'verify' | 'reset'
  account_id  text not null references accounts(id) on delete cascade,
  token_hash  text not null unique,          -- sha256(token)
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists auth_tokens_account_idx on auth_tokens (account_id, purpose);
create index if not exists auth_tokens_expires_idx on auth_tokens (expires_at);

-- ---- Fixed-window rate limiting (DB-backed, serverless-safe) ------------
create table if not exists rate_limits (
  bucket       text primary key,             -- e.g. 'signup:1.2.3.4'
  count        integer not null default 0,
  window_start timestamptz not null default now()
);
create index if not exists rate_limits_window_idx on rate_limits (window_start);
