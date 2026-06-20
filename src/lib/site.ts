/** Global site configuration — single source of truth for chrome + SEO. */
export const siteConfig = {
  name: "ORVOX",
  /** Used in <title> templates; dot-separated to match the brand voice. */
  tagline: "Argue better. Win louder.",
  description:
    "ORVOX is where students compete in debate and public speaking, follow live rounds, and get structured feedback from real adjudicators.",
  url: "https://orvox.in",
  season: "S03",
  city: "Mumbai",
  email: "hello@orvox.in",
  socials: {
    instagram: "https://instagram.com/orvox",
    twitter: "https://twitter.com/orvox",
    youtube: "https://youtube.com/@orvox",
    linkedin: "https://linkedin.com/company/orvox",
  },
} as const;

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
