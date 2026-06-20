// Seeds the Neon database from the existing typed seed modules so the
// DB-backed public site renders identically, then seeds admin-managed
// defaults (settings, nav, flags, content blocks, FAQs).
//
// Run:  node scripts/seed.mjs
import { Client, neonConfig } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
neonConfig.webSocketConstructor = globalThis.WebSocket;

// Node 24 strips types from these .ts imports (type-only imports inside).
const { events } = await import("../src/lib/data/events.ts");
const { resources } = await import("../src/lib/data/resources.ts");
const { siteConfig, mainNav, footerNav } = await import("../src/lib/site.ts");

const client = new Client(process.env.DATABASE_URL);
await client.connect();
const q = (text, params) => client.query(text, params);

try {
  // ---- Events + schedule -------------------------------------------------
  let evIdx = 0;
  for (const e of events) {
    await q(
      `insert into events (
        id, slug, title, subtitle, season, track, accent, status, format, mode,
        venue, city, start_date, end_date, registration_deadline, eligibility,
        seats_total, seats_filled, prize_pool, hero_stat_value, hero_stat_label,
        summary, about, rules, eligibility_details, contact_name, contact_role,
        contact_email, tags, published, featured, sort_order
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
      )
      on conflict (id) do update set
        slug=excluded.slug, title=excluded.title, subtitle=excluded.subtitle,
        season=excluded.season, track=excluded.track, accent=excluded.accent,
        status=excluded.status, format=excluded.format, mode=excluded.mode,
        venue=excluded.venue, city=excluded.city, start_date=excluded.start_date,
        end_date=excluded.end_date, registration_deadline=excluded.registration_deadline,
        eligibility=excluded.eligibility, seats_total=excluded.seats_total,
        seats_filled=excluded.seats_filled, prize_pool=excluded.prize_pool,
        hero_stat_value=excluded.hero_stat_value, hero_stat_label=excluded.hero_stat_label,
        summary=excluded.summary, about=excluded.about, rules=excluded.rules,
        eligibility_details=excluded.eligibility_details, contact_name=excluded.contact_name,
        contact_role=excluded.contact_role, contact_email=excluded.contact_email,
        tags=excluded.tags, updated_at=now()`,
      [
        e.id, e.slug, e.title, e.subtitle, e.season, e.track, e.accent, e.status,
        e.format, e.mode, e.venue, e.city, e.startDate, e.endDate,
        e.registrationDeadline, e.eligibility, e.seatsTotal, e.seatsFilled,
        e.prizePool ?? null, e.heroStat.value, e.heroStat.label, e.summary,
        e.about, e.rules, e.eligibilityDetails, e.contact.name, e.contact.role,
        e.contact.email, e.tags, true, evIdx === 0, evIdx,
      ],
    );
    await q(`delete from schedule_rounds where event_id=$1`, [e.id]);
    let pos = 0;
    for (const r of e.schedule) {
      await q(
        `insert into schedule_rounds (event_id, position, label, date, detail)
         values ($1,$2,$3,$4,$5)`,
        [e.id, pos++, r.label, r.date, r.detail],
      );
    }
    evIdx++;
  }
  console.log(`Seeded ${events.length} events.`);

  // ---- Resources ---------------------------------------------------------
  for (const r of resources) {
    await q(
      `insert into resources (id, slug, title, type, track, accent, description, author, minutes, updated_at, featured, published)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)
       on conflict (id) do update set
         slug=excluded.slug, title=excluded.title, type=excluded.type, track=excluded.track,
         accent=excluded.accent, description=excluded.description, author=excluded.author,
         minutes=excluded.minutes, updated_at=excluded.updated_at, featured=excluded.featured`,
      [r.id, r.slug, r.title, r.type, r.track, r.accent, r.description, r.author, r.minutes, r.updatedAt, !!r.featured],
    );
  }
  console.log(`Seeded ${resources.length} resources.`);

  // ---- Site settings -----------------------------------------------------
  const settings = {
    site: {
      name: siteConfig.name,
      tagline: siteConfig.tagline,
      description: siteConfig.description,
      url: siteConfig.url,
      season: siteConfig.season,
      city: siteConfig.city,
    },
    seo: {
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
      keywords: "debate, public speaking, competition, students, ORVOX",
      ogImage: "/opengraph-image",
    },
    social: { ...siteConfig.socials },
    contact: {
      email: siteConfig.email,
      phone: "",
      address: siteConfig.city,
      hours: "Mon–Fri, 10:00–18:00 IST",
    },
    email_templates: {
      registration_confirmation: {
        subject: "You're on the card — {{eventTitle}}",
        body: "Hi {{name}},\n\nYour seat for {{eventTitle}} is confirmed. Your confirmation code is {{code}}.\n\nSee you in the room.\n— ORVOX",
      },
      waitlist: {
        subject: "Waitlisted — {{eventTitle}}",
        body: "Hi {{name}},\n\nYou're on the waitlist for {{eventTitle}}. We'll be in touch the moment a seat opens.\n\n— ORVOX",
      },
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await q(
      `insert into site_settings (key, value) values ($1, $2)
       on conflict (key) do nothing`,
      [key, JSON.stringify(value)],
    );
  }
  console.log(`Seeded ${Object.keys(settings).length} settings groups.`);

  // ---- Navigation --------------------------------------------------------
  const navCount = (await q(`select count(*)::int as n from nav_items`)).rows[0].n;
  if (navCount === 0) {
    let pos = 0;
    for (const item of mainNav) {
      await q(
        `insert into nav_items (location, group_label, label, href, position, enabled)
         values ('header', '', $1, $2, $3, true)`,
        [item.label, item.href, pos++],
      );
    }
    for (const col of footerNav) {
      let fp = 0;
      for (const link of col.links) {
        await q(
          `insert into nav_items (location, group_label, label, href, position, enabled)
           values ('footer', $1, $2, $3, $4, true)`,
          [col.title, link.label, link.href, fp++],
        );
      }
    }
    console.log("Seeded navigation items.");
  }

  // ---- Section + page visibility flags -----------------------------------
  const flags = [
    ["section:hero", "Hero", "section"],
    ["section:proof", "Proof / stats band", "section"],
    ["section:tracks", "Tracks", "section"],
    ["section:upcoming", "Upcoming events", "section"],
    ["section:judges", "Judges band", "section"],
    ["section:resources", "Resources teaser", "section"],
    ["section:closing-cta", "Closing CTA", "section"],
    ["page:events", "Events page", "page"],
    ["page:resources", "Resources page", "page"],
    ["page:results", "Results page", "page"],
    ["page:about", "About page", "page"],
    ["page:contact", "Contact page", "page"],
    ["banner:announcement", "Site announcement banner", "banner"],
  ];
  for (const [key, label, grp] of flags) {
    await q(
      `insert into site_flags (key, label, grp, enabled) values ($1,$2,$3,true)
       on conflict (key) do nothing`,
      [key, label, grp],
    );
  }
  console.log(`Seeded ${flags.length} site flags.`);

  // ---- Content blocks ----------------------------------------------------
  const blocks = [
    ["home.hero", "home", "Homepage hero", { eyebrow: "Season " + siteConfig.season + " · live", title: "Argue better. Win louder.", subtitle: siteConfig.description, ctaPrimary: "Browse events", ctaSecondary: "How it works" }],
    ["home.announcement", "home", "Announcement banner", { text: "Registration open for Season " + siteConfig.season + ".", href: "/events" }],
    ["about.manifesto", "about", "About manifesto", { heading: "We run the room like a broadcast.", body: "ORVOX treats a school debate with the production values of a televised title fight." }],
    ["contact.intro", "contact", "Contact intro", { heading: "Talk.", body: "Questions about an event, judging, or partnerships? Reach the desk." }],
    ["footer.tagline", "footer", "Footer tagline", { text: siteConfig.tagline }],
  ];
  for (const [key, grp, label, value] of blocks) {
    await q(
      `insert into content_blocks (key, grp, label, value) values ($1,$2,$3,$4)
       on conflict (key) do nothing`,
      [key, grp, label, JSON.stringify(value)],
    );
  }
  console.log(`Seeded ${blocks.length} content blocks.`);

  // ---- FAQs --------------------------------------------------------------
  const faqCount = (await q(`select count(*)::int as n from faqs`)).rows[0].n;
  if (faqCount === 0) {
    const faqs = [
      ["Who can compete in ORVOX events?", "Students aged 15–22. Each event lists its exact eligibility on the event page.", "Eligibility", 0],
      ["How do I register for an event?", "Open any event from the Events page and use the register rail. You'll get a confirmation code instantly.", "Registration", 1],
      ["Is there a registration fee?", "Fees vary per event and are shown on each event page. Many qualifiers are free.", "Registration", 2],
      ["How does judging work?", "Accredited adjudicators score every round on a four-band rubric: content, style, strategy, and impact.", "Judging", 3],
      ["When are results published?", "Results and judge feedback are published to your dashboard as soon as a room closes.", "Results", 4],
    ];
    for (const [question, answer, category, position] of faqs) {
      await q(
        `insert into faqs (question, answer, category, position, published) values ($1,$2,$3,$4,true)`,
        [question, answer, category, position],
      );
    }
    console.log(`Seeded ${faqs.length} FAQs.`);
  }

  console.log("\nSeed complete.");
} finally {
  await client.end();
}
