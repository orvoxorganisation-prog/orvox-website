# Product

## Register

brand

## Users

Three audiences, one platform:

- **Competitors** (students, 15-22, India-first): find competitions, register, follow live rounds, read judge feedback. They are design-literate consumers of Discord, Arc, and Instagram; they smell a template instantly.
- **Judges / adjudicators**: score rounds on a rubric between rooms, often on a laptop in a noisy venue. They need speed and zero ambiguity.
- **Coaches & organisers**: track students across a season.

The public site is read in the evening, on phones, deciding whether this forum is worth a weekend. The dashboard and judge portal are used during live event days under time pressure.

## Product Purpose

ORVOX runs youth debate and public-speaking competitions end to end: listings, registration, schedules, live adjudication, results, structured feedback. Success = a student registers for a second event, and a judge finishes a scoresheet without asking how.

## Brand Personality

**Broadcast, cocky, precise.** "Argue better. Win louder." — short, dry, slightly arrogant. The product treats a school debate with the production values of a televised title fight. Emotional goals: a competitor should feel *on the card*; a judge should feel *in the booth*.

## Anti-references

- Generic light SaaS admin panels (stat-card rows, white cards on gray, sidebar + topbar from a template).
- Eventbrite / school-portal event listings.
- AI-purple gradient SaaS landings; cream-and-serif editorial defaults.
- Any page where marketing and product look like two different companies.

## Design Principles

1. **One world, one theme.** The Control Room is dark everywhere — marketing, auth, dashboard, judge booth. The user signed up inside a broadcast; they stay inside it. No theme flip at the login door.
2. **Color is signal, not decoration.** Yellow = winning / primary action. Teal = live / on-stage. Rose = editorial / the human voice. Red = on-air. If a color has no meaning, it isn't there.
3. **The scoreboard is the aesthetic.** Mono numerals, rubric pips, seat meters, live lamps. Data presented like a broadcast lower-third, not like a widget.
4. **Brand surfaces perform, product surfaces respond.** Marketing gets scroll choreography and entrance reveals; the dashboard and judge booth get 150-250ms state-driven motion and zero load theatre.
5. **Depth is built, not blurred.** Glass means layered surfaces: shell tray → core plate → edge light → atmospheric glow behind. Never blur + border alone.

## Accessibility & Inclusion

- WCAG AA contrast minimum on all text (body ≥ 4.5:1 against dark surfaces — ink-300 or lighter on void/stage).
- `prefers-reduced-motion` honored by every GSAP/Motion animation; content never gated on JS reveals.
- Keyboard-operable nav, tabs, score pips, toggles; focus ring flips to yellow on dark surfaces.
- `prefers-reduced-transparency` fallbacks for all glass materials.
