# ORVOX

**Argue better. Win louder.**

A youth forum for debate and public speaking — competition listings, online
registration, event scheduling, live adjudication, results, and structured
feedback, in one place. This repository is the production-quality MVP.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` design tokens)
- **GSAP** + `@gsap/react` — scroll reveals, curtain text reveals, parallax,
  magnetic interactions, count-ups, the equalizer motif
- **Motion** (Framer Motion) — interruptible component transitions (tabs,
  filters, drawers) where it beats GSAP
- **Lucide** icons (+ inline brand glyphs)
- **React Hook Form** + **Zod** — typed, validated forms
- **Neon / Postgres** — optional, DB-ready data layer
- `sonner` toasts, `class-variance-authority`, `tailwind-merge`

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

The app runs with **no environment variables** — every public surface is backed
by typed seed data in `src/lib/data`. To enable database persistence, copy
`.env.example` to `.env.local` and set `DATABASE_URL` (see below).

## Architecture

```
src/
  app/
    (marketing)/        # public site — shares the header + footer
      page.tsx          # landing
      events/           # listing · [slug] detail · [slug]/register
      results/          # listing · [slug] detail
      resources/        # listing · [slug] detail
      about/ contact/
    (auth)/             # login · signup (split-screen shell)
    dashboard/          # participant app shell + 8 sub-pages
    judge/              # adjudication portal + scoring screen
    opengraph-image.tsx # dynamic branded OG (next/og)
    sitemap.ts robots.ts not-found.tsx error.tsx
  components/
    ui/                 # design-system primitives (button, card, badge, …)
    motion/             # GSAP/Motion building blocks (reveal, word-reveal, …)
    sections/           # landing-page sections
    events/ resources/ results/ app/ auth/ contact/ seo/
  lib/
    data/               # seed data + domain types (the source of truth)
    db/                 # Neon client + schema.sql
    validations/        # Zod schemas
    repo.ts             # async repository layer (swap seed → DB here)
    accent.ts motion.ts site.ts utils.ts
```

### Data layer

Pages depend on the **repository layer** (`src/lib/repo.ts`), never on seed
modules directly. Today the repo resolves in-memory seed data; pointing it at
Postgres means changing only that one file. Registration server actions already
insert into Neon when `DATABASE_URL` is present and fall back to a generated
confirmation code otherwise.

### Connect a database (optional)

1. Create a project at [neon.tech](https://neon.tech) and copy the pooled
   connection string.
2. `cp .env.example .env.local` and set `DATABASE_URL`.
3. Apply the schema: `psql "$DATABASE_URL" -f src/lib/db/schema.sql`
   (`src/lib/db/schema.sql` mirrors the types in `src/lib/data/types.ts`).

## Design system

Encoded from the official ORVOX brand kit in `src/app/globals.css`:

- **Noir backbone** ink scale carries ~50% of every surface; the **yellow /
  teal / rose** pastel triad appears _next_ to it, never washed over text.
- **Type** — Space Grotesk (display, −0.04em), Instrument Serif (one-word
  cinematic italic accents), JetBrains Mono (stats, eyebrows, countdowns).
- **Radii** — 6 / 14 / 28 / 48 / pill. The pill is the signature on every button.
- **Motion** — 120 / 260 / 420ms, snappy never bouncy, custom ease-out curves,
  reduced-motion safe throughout.

## Accessibility & performance

- Mobile-first, responsive across all breakpoints; skip-to-content link.
- Keyboard-operable nav, tabs, score pips, and toggles with ARIA roles.
- `prefers-reduced-motion` honored by every animation.
- Static generation (SSG) for events, resources, results, and judge rounds;
  per-route metadata, canonical URLs, JSON-LD, sitemap, robots, and dynamic OG.

## Demo notes

Authentication and the participant/judge identities are seeded for the MVP —
login/signup route to the dashboard, and forms simulate the network round-trip
so loading, success, and error states are real. Swap the repo layer for live
data and wire an auth provider to take it to production.
