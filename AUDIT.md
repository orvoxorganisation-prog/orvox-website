# ORVOX Full Redesign Audit — June 2026

The verdict in one line: **the marketing home already speaks the brand ("Control
Room" dark broadcast), and every other surface belongs to a different, cheaper
product.** Click any nav item from the dark hero and the site flips to a white
Eventbrite clone; log in and you land in a gray Tailwind admin template. The
redesign unifies the whole product into the dark broadcast world and rebuilds
every page composition inside it. Roughly 75-80% of visible UI changes.

Cross-cutting failures (every light page):

- **Theme schism.** Dark branded home → white inner pages → gray admin. Three
  visual companies in one domain.
- **White card + `ring-ink-200` is the only material.** Cards inside sections
  inside cards. No depth, no lighting, no brand without the logo.
- **Eyebrow scaffolding.** `/ about ORVOX`, `/ the mission`, `/ who it's for` —
  a tracked mono label above *every* heading. AI grammar.
- **Identical card grids** for personas, values, achievements, stats, quick
  links. Same 3-col rhythm everywhere.
- **Stat-card spam** on dashboard home and results (icon + number + label × N).
- **Motion stops at the front door.** GSAP choreography on home; inner pages
  get one generic `Reveal` fade; product pages get nothing.

---

## Marketing

### Home `/`
- **Problems:** Strongest page, but: the broadcast-grid hero backdrop is static
  (no depth response to scroll); `ScrollStory` is a flat 4-column row wearing a
  "story" name; sections repeat the same `flex justify-between` header; the
  yellow scoreboard never updates (a "live" board that is dead).
- **Redesign:** Keep the hero composition (it is the brand's best moment) but
  make the scoreboard *alive* (score ticks, rotating rubric pips) and give the
  hero scroll-out parallax. Rebuild `ScrollStory` as a real scroll-driven
  sequence: pinned broadcast timeline where the playhead draws along a rule and
  each step lights its lamp as the scrub passes. Differentiate section headers.
- **Motion:** GSAP ScrollTrigger scrub on the run-of-play playhead; parallax
  drift on hero grid + scoreboard; magnetic CTAs (exists); marquee (exists,
  stays the page's single marquee); count-up on proof stats.
- **Memorable because:** the page behaves like a broadcast — something is
  always quietly *on air*.

### Events `/events`
- **Problems:** White `PageHeader` band + filter pills + uniform white card
  grid. The most important commercial page reads like a school portal. Seat
  meters are gray-on-white whispers.
- **Redesign:** Dark. Masthead under a `spotlight`; the flagship event becomes
  a full-width *billboard board* (yellow drench, scoreboard DNA); remaining
  events become a **fixture ledger** — broadcast schedule rows (date block ·
  title · venue · seat meter · status lamp), not cards. Track filter as a
  segmented glass rail.
- **Motion:** Motion layout-animated filter transitions (exists, re-skinned);
  GSAP row reveal in tight stagger; seat meters fill on first view; live
  lamps pulse.
- **Memorable because:** it reads like tonight's fight card, not a listing.

### Event detail `/events/[slug]`
- **Problems:** White hero with pastel patch + white info cards + generic tabs.
  Critical CTA (Register) visually equal to everything else.
- **Redesign:** Dark event "broadside": masthead with oversized display title,
  signal-color serif subtitle, countdown to deadline (mono), sticky register
  rail on desktop (shell/core glass) with seat meter + fee + CTA. Tabs become
  broadcast rundown sections.
- **Motion:** countdown ticks; sticky rail enters with spring; tab crossfade
  via Motion; rubric/format rows stagger in.
- **Memorable because:** every event page feels like a title-fight poster.

### Register `/events/[slug]/register`
- **Problems:** Plain white form card; the decisive conversion moment has the
  least design on the site.
- **Redesign:** Dark two-column: form on a `core` glass plate, event summary as
  a compact board (title, date, seat meter, fee) that *stays* while the form
  scrolls. Inputs re-cut for dark (ink-800 fields, yellow focus).
- **Motion:** field focus glow 150ms; submit button morphs to loading; success
  state = confirmation code stamped in mono with a one-shot yellow flash.
- **Memorable because:** registering feels like being added to the card.

### Results `/results` + `/results/[slug]`
- **Problems:** White list + table. The page that should feel like a podium has
  zero ceremony. Champion row styled identically to 9th place.
- **Redesign:** Dark. Index = season ledger with champion named per row in
  yellow. Detail = **podium board**: champion strip drenched in yellow with
  winner-glow, rest of standings as broadcast table (mono numerals, signal
  status chips), judge feedback as rose editorial pull-quotes.
- **Motion:** standings rows cascade with rank-ordered stagger; champion glow
  ignites once on first view (GSAP, once: true); count-up on point totals.
- **Memorable because:** results are announced, not displayed.

### Resources `/resources` + `/resources/[slug]`
- **Problems:** White card grid by type; article page is a plain prose column.
- **Redesign:** Dark library: type filter as glass rail; **mixed-size bento**
  (featured guide = large cell with teal wash, drills compact) — exact cell
  count, varied backgrounds. Article = dark editorial: 65ch ink-200 prose,
  rose serif pull lines, mono section markers in margin.
- **Motion:** bento cells reveal in batch; reading-progress hairline draws
  along the top of the article (GSAP scrub).
- **Memorable because:** the prep room shares the arena's lighting.

### About `/about`
- **Problems:** Eyebrow-above-everything scaffolding; persona card trio +
  numbered values trio = template grammar; white-to-gray banding.
- **Redesign:** Dark manifesto. Big editorial opening (highlighted "argue"
  stays, re-cut on dark); mission as full-width statement band with WordReveal;
  personas as three *seats in the room* — asymmetric split list, not cards;
  values as one numbered broadcast rundown (the page's single legitimate
  numbered sequence). Eyebrows cut to one.
- **Motion:** WordReveal manifesto; scroll-scrubbed highlight sweep on the
  yellow word; rundown rows light sequentially.
- **Memorable because:** it argues at you — typography does the talking.

### Contact `/contact`
- **Problems:** White split with form card; inert.
- **Redesign:** Dark switchboard: oversized "Talk." display headline, contact
  channels as glass console rows (mail, socials with real glyphs), form on a
  core plate with dark inputs.
- **Motion:** form field micro-interactions; submit morph; channel rows
  slide-hover.
- **Memorable because:** even the contact page is on air.

## Auth

### Login + Signup `(auth)`
- **Problems:** Light form half + dark brand half = the theme schism in a
  single viewport. Decorative gray equalizer bars read as placeholder.
- **Redesign:** Fully dark. One centered `shell`/`core` glass card on
  `void-mesh`; brand side becomes a live ticker column (rotating season stats /
  alum quote) instead of static bars. Inputs dark, yellow focus ring.
- **Motion:** card enters once (scale 0.97 → 1, expo.out); ticker crossfades;
  error shake 120ms.
- **Memorable because:** logging in = stepping through the stage door.

## Dashboard (participant)

### Shell (all pages)
- **Problems:** White sidebar + gray content + white topbar = admin template.
  Zero brand. The single worst offender against the brief.
- **Redesign:** **Broadcast console.** Void background with mesh; left rail =
  dark glass column (logo, nav with yellow active lamp, season chip);
  topbar = thin glass strip with live clock (mono) + notifications + avatar.
  Content sits as `panel` plates on void.
- **Motion:** active-nav lamp slides via Motion layout; page content fades up
  240ms once; rail badge count-pulse on change. No load theatre.

### Dashboard home `/dashboard`
- **Problems:** Stat-card row + white next-event card + announcement list +
  quick-links grid. Pure admin-panel grammar.
- **Redesign:** **Monitor wall.** One hero board: "next event" as a broadcast
  card (dark core, countdown, round schedule, register state) — the room you
  are due in. Beside it a vertical *feed* (announcements as timestamped wire
  items, not cards). Season stats become one mono strip under the greeting
  (6 rounds · #4 best · 78.2 avg), not three cards. Quick links die; the rail
  already navigates.
- **Motion:** countdown live; feed items slide in with 40ms stagger; stat
  strip counts up once.

### Registrations `/dashboard/registrations`
- **Problems:** White rows with badges; "View" ghost buttons.
- **Redesign:** Fixture list on dark: each registration a console row with
  date block, status lamp (confirmed teal / waitlist amber), next-round
  countdown inline.
- **Motion:** row hover lift 150ms; status lamps pulse only when a round is
  within 24h.

### Dashboard events / resources
- **Problems:** Re-serve marketing white cards inside the gray shell.
- **Redesign:** Compact dark ledger variants of the marketing fixture/library
  rows, tuned for density.
- **Motion:** list stagger only.

### Results `/dashboard/results`
- **Problems:** Four stat cards + white list.
- **Redesign:** **Speaker tape:** personal season header as one wide board
  (rank, average as big mono numerals with spark-bars), then published
  standings as ledger rows with champion named in yellow.
- **Motion:** numerals count up once; rows cascade.

### Achievements `/dashboard/achievements`
- **Problems:** Identical 3-col badge cards; locked = gray version of same card.
- **Redesign:** **Trophy shelf:** earned achievements as lit glass plaques
  (signal-colored icon disc, edge-light), locked as dim sockets with subtle
  outline only — two visibly different materials on one shelf.
- **Motion:** plaques ignite on scroll into view (glow fades in once);
  hover tilt (3°) on earned only.

### Profile + Settings
- **Problems:** White form cards, default switches.
- **Redesign:** Dark console forms on `panel`; identity header with avatar +
  school + season chip; switches re-cut with teal on-state.
- **Motion:** toggle springs; save button morph; toast (sonner) re-skinned dark.

## Judge portal

### Shell + Rounds `/judge`
- **Problems:** Same light admin shell; rounds as white cards with "Score now".
- **Redesign:** **The booth.** Same console shell DNA but denser; rounds queue
  as a rundown: time block (mono), matchup A vs B, motion line in serif italic,
  status lamp; the next round to score is elevated (`panel-raised`, yellow
  edge).
- **Motion:** queue reorders with Motion layout when a sheet is submitted;
  active row's lamp pulses.

### Evaluate `/judge/evaluate/[id]` (score sheet)
- **Problems:** Light form; rubric pips exist but visually mute; the room's
  most critical workflow looks like a survey.
- **Redesign:** **Scoring desk:** dark split — matchup header pinned (teams,
  motion, timer), rubric bands as console rows with large tappable pips
  (yellow fill, mono totals computing live), notes field on glass, submit as
  the single yellow action.
- **Motion:** pips fill 120ms each with tick; running totals tween
  (gsap quickTo); submit → stamped "SUBMITTED" state. Nothing decorative.

### Evaluations / Feedback / Judge profile
- **Problems:** White lists/cards again.
- **Redesign:** Booth ledgers: submitted sheets as rows with score deltas in
  mono; feedback threads as rose editorial blocks; profile as identity panel
  with accreditation chip.
- **Motion:** list stagger; nothing else.

## System pages

### 404 + error
- **Problems:** White, centered, off-brand.
- **Redesign:** Dark dead-air screen: static-noise grain on void, huge mono
  "404 / OFF AIR", signal-lamp red, pill back to the floor.
- **Motion:** grain shimmer (reduced-motion safe), lamp blink.

---

## Motion system (cross-page, GSAP-first)

| Layer | Tool | Where |
| --- | --- | --- |
| Headline word reveals | GSAP curtain (`WordReveal`) | marketing mastheads |
| Scroll choreography | ScrollTrigger scrub + pin | home run-of-play, article progress |
| Parallax atmosphere | ScrollTrigger scrub on mesh/grid layers | heroes, footers |
| Entrance staggers | GSAP batch / Reveal | ledgers, bentos, queues |
| Live elements | CSS keyframes (lamps, eq) + gsap quickTo (totals) | boards, booth |
| State transitions | Motion (layout, AnimatePresence) | filters, tabs, nav lamp, drawers |
| Magnetic / press | GSAP quickTo + CSS active scale | CTAs only |

Reduced motion: every GSAP entrance is gated by `prefers-reduced-motion`
(via gsap.matchMedia / useReducedMotion in effects only — never SSR state);
scrub/pin collapse to static; lamps stop pulsing.
