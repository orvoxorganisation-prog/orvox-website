# ORVOX Design System — "The Control Room"

One concept carries every surface: **a live broadcast gallery.** The marketing
site is the show; the dashboard is the competitor's monitor wall; the judge
portal is the adjudication booth. Dark-first everywhere. Defined in
`src/app/globals.css` (Tailwind v4 `@theme`).

## Theme

Dark, always. Page background is `--color-void` (#050608) with brand-colored
atmospheric light baked in (`void-mesh`). Light surfaces survive only as
deliberate "paper" moments (pastel feature cards on marketing), never as page
chrome. There is no light/dark toggle; the brand is the theme.

## Color

Noir backbone + signal triad. Hex tokens in `@theme`:

| Role | Token | Use |
| --- | --- | --- |
| Canvas (dark) | `void` #050608, `stage` #0b0c0f | page + cinematic sections |
| Panels | `surface` #0e1015, `surface-2` #14171d | raised dark plates |
| Ink scale | `ink-900` … `ink-50` | text ramp. On dark: body = ink-300+, muted = ink-400, never darker for copy |
| **Yellow · SIGNAL** | `yellow` #ffd02f / `yellow-deep` | winners, primary CTA, focus on dark |
| **Teal · LIVE** | `teal` #0fbcb0 / `teal-deep` | live states, on-stage, progress |
| **Rose · EDITORIAL** | `rose-deep` #f08bd2 | quotes, human voice |
| On-air | `live` #ff4438 | live pulse lamp only |
| States | `success` `danger` `warning` | semantic |

Accent mapping for dark surfaces lives in `lib/accent.ts` (`darkAccent`).
Color strategy: **Committed** — the dark noir carries 70%+ of every surface,
signal colors are meaningful punctuation, with one Drenched moment per page
maximum (e.g. the yellow scoreboard).

## Typography

- **Space Grotesk** (`--font-sans`) — display + UI. Display: 700, -0.04em,
  lh 1.02 (`.display`). Hero scale `clamp(3.25rem, 9vw, 7rem)`.
- **Instrument Serif italic** (`--font-serif`) — one-word cinematic accents
  (`em`), colored with a signal color. Never body copy.
- **JetBrains Mono** (`--font-mono`) — every numeral, stat, timestamp,
  countdown, eyebrow. `tnum` + `zero` via `.tabular`.
- Product surfaces: fixed rem scale, weight contrast over size contrast.

## Materials (glass & depth)

Multi-layer, machined-hardware depth — never flat blur+border:

- `.shell` + `.r-shell` — outer machined tray (gradient, hairline, deep shadow).
- `.core` + `.r-core` — inner glass plate with top edge-light. Concentric radii.
- `.panel` / `.panel-raised` — workhorse dark console panels (dashboard, judge).
- `.glass-dark` — frosted overlay chrome (floating nav island).
- `.void-mesh` — atmospheric brand-color light sources on void.
- `.spotlight` — radial stage-light falloff for page mastheads.
- `.edge-light` — hairline top highlight on any raised dark element.
- All glass has `prefers-reduced-transparency` solid fallbacks.

## Components

- **Buttons**: pill signature. Primary on dark = `bg-canvas text-stage`
  (white pill) or `bg-yellow text-ink-900` for signal moments; ghost =
  `ring-white/12` + `hover:bg-white/5`. Press = `active:scale-[0.97]`.
- **Signal lamp**: 1.5px dot + `live-pulse` for anything currently live.
- **Eyebrow**: mono, 11px, 0.18em tracking — a named broadcast lower-third
  device, rationed (≤ 1 per 3 sections; not above every heading).
- **Score pips**: 1.5×3.5 rounded bars, filled with signal color.
- **Seat meter**: hairline track + signal fill + mono caption.
- **Cards**: dark `panel` is default; pastel feature card survives only as a
  marketing "paper" moment; nested cards banned.

## Layout

- Container `max-w-[78rem]`; section rhythm varies (py-20 → py-32), no
  uniform card grids; each major section gets its own composition
  (split, band, ledger, marquee, bento with mixed cells).
- Dashboard: console layout — fixed dark rail (icon + label), content as
  panels on void, one hero "next event" board, no stat-card spam.
- Z-scale: dropdown 20 → sticky 30 → backdrop 40 → drawer/modal 50 →
  toast 60 → tooltip 70.

## Motion

GSAP-first (registered in `lib/gsap.ts`; `useGSAP` + scope everywhere).

- Easing: `--ease-out-expo` / `power3.out` family; never bounce.
- Durations: micro 120ms, UI 260ms, stage 420ms (`lib/motion.ts`).
- Marketing: WordReveal headlines, scroll-driven section choreography
  (ScrollTrigger), parallax atmosphere, magnetic CTAs, marquee (max 1/page).
- Product: state transitions only, 150-250ms; entrance fades ≤ 0.4s with
  tight stagger; no pinning, no scroll theatre.
- Reduced motion: every effect collapses to static/opacity; SSR-rendered
  initial state must NOT depend on `useReducedMotion()` (hydration).
