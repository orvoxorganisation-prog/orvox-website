/** Global site configuration — single source of truth for chrome + SEO. */
export const siteConfig = {
  name: "ORVOX",
  legalName: "ORVOX",
  /** Used in <title> templates; dot-separated to match the brand voice. */
  tagline: "Argue better. Win louder.",
  description:
    "ORVOX is where students compete in debate and public speaking, follow live rounds, and get structured feedback from real adjudicators.",
  url: "https://orvox.in",
  /** Absolute logo URL for structured data + OG fallbacks. */
  logo: "https://orvox.in/favicon.svg",
  ogImage: "https://orvox.in/opengraph-image",
  season: "S03",
  city: "Mumbai",
  region: "Maharashtra",
  country: "IN",
  foundingYear: "2024",
  locale: "en_IN",
  email: "hello@orvox.in",
  socials: {
    instagram: "https://instagram.com/orvox",
    twitter: "https://twitter.com/orvox",
    youtube: "https://youtube.com/@orvox",
    linkedin: "https://linkedin.com/company/orvox",
  },
} as const;

/**
 * Topical authority signals (schema.org `knowsAbout`). Tells search + LLMs the
 * entities ORVOX is an authority on, so it can be cited for these subjects.
 */
export const orgTopics = [
  "Student debate competitions",
  "Public speaking contests",
  "British Parliamentary debate",
  "Model United Nations (MUN)",
  "Youth leadership development",
  "Academic enrichment",
  "Competitive debating",
  "Debate adjudication",
  "Extempore and elocution",
  "Pitch and startup competitions",
] as const;

/**
 * Structured contact channels (schema.org ContactPoint). Used by the
 * Organization graph and the contact page so answer engines surface the right
 * way to reach ORVOX.
 */
export const contactPoints = [
  {
    contactType: "customer support",
    email: "hello@orvox.in",
    availableLanguage: ["English", "Hindi"],
    areaServed: "IN",
  },
  {
    contactType: "media relations",
    email: "press@orvox.in",
    availableLanguage: ["English"],
    areaServed: "IN",
  },
] as const;

/**
 * Site-wide FAQ — the canonical "what is ORVOX / how does it work" answers.
 * Rendered as visible Q&A (AEO) on the homepage and emitted as FAQPage schema
 * so AI answer engines can quote them verbatim with attribution.
 */
export const siteFaqs = [
  {
    q: "What is ORVOX?",
    a: "ORVOX is a youth competition platform where students compete in debate and public speaking. It handles registration, live round scheduling, real-time scoring, and structured written feedback from accredited adjudicators — all in one place.",
  },
  {
    q: "Who can take part in ORVOX competitions?",
    a: "ORVOX is open to high school and college students, typically ages 14–22. Most events welcome both first-time competitors and experienced debaters; eligibility for each competition is listed on its event page.",
  },
  {
    q: "How much does it cost to compete?",
    a: "Entry to ORVOX competitions is free. You register on the event page, get confirmation by email, and receive your round schedule on your dashboard.",
  },
  {
    q: "What debate formats does ORVOX use?",
    a: "ORVOX runs British Parliamentary debate, open-platform public speaking, op-ed writing, and pitch competitions. Each event page lists its exact format, rules, and round structure.",
  },
  {
    q: "How does scoring and feedback work?",
    a: "Every round is scored on the ORVOX rubric by accredited adjudicators. Standings publish within minutes of a round closing, and each speaker receives specific written feedback from the panel that judged them.",
  },
  {
    q: "Where does ORVOX run its competitions?",
    a: "ORVOX runs online qualifier rounds plus on-site finals in Indian cities including Mumbai, New Delhi, and Bengaluru. Many events are hybrid: you qualify online and compete in person at the final.",
  },
] as const;

/** Primary public navigation (header + footer). */
export const mainNav = [
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Results", href: "/results" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Footer link columns. */
export const footerNav = [
  {
    title: "Compete",
    links: [
      { label: "Browse events", href: "/events" },
      { label: "Register", href: "/events" },
      { label: "Results", href: "/results" },
      { label: "Rankings", href: "/results" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Resource library", href: "/resources" },
      { label: "Debate guides", href: "/resources?type=guide" },
      { label: "Speaking drills", href: "/resources?type=drill" },
      { label: "For judges", href: "/judge" },
    ],
  },
  {
    title: "Forum",
    links: [
      { label: "About ORVOX", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Judge portal", href: "/judge" },
    ],
  },
] as const;
