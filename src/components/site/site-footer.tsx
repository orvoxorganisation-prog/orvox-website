import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footerNav, siteConfig } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { Equalizer } from "@/components/ui/equalizer";
import { Reveal } from "@/components/motion/reveal";
import { InstagramIcon, XIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/social-icons";
import { isDbConfigured } from "@/lib/db/client";
import { dbListNav, dbGetSetting } from "@/lib/db/public";

type SocialLink = { label: string; href: string; Icon: typeof InstagramIcon };
type FooterColumn = { title: string; links: { label: string; href: string }[] };

const SOCIAL_ICONS: Record<string, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  twitter: XIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
};

/** Footer nav + social links resolve from the admin-managed DB, with the
 *  static site config as a fallback so the footer never breaks. */
async function getFooterData(): Promise<{ columns: FooterColumn[]; socials: SocialLink[] }> {
  const fallbackSocials: SocialLink[] = [
    { label: "Instagram", href: siteConfig.socials.instagram, Icon: InstagramIcon },
    { label: "Twitter", href: siteConfig.socials.twitter, Icon: XIcon },
    { label: "YouTube", href: siteConfig.socials.youtube, Icon: YoutubeIcon },
    { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: LinkedinIcon },
  ];
  const fallbackColumns: FooterColumn[] = footerNav.map((c) => ({ title: c.title, links: c.links.map((l) => ({ label: l.label, href: l.href })) }));

  if (!isDbConfigured) return { columns: fallbackColumns, socials: fallbackSocials };

  try {
    const [nav, social] = await Promise.all([dbListNav("footer"), dbGetSetting<Record<string, string>>("social")]);

    const columns: FooterColumn[] = [];
    for (const item of nav) {
      const title = item.groupLabel || "More";
      let col = columns.find((c) => c.title === title);
      if (!col) {
        col = { title, links: [] };
        columns.push(col);
      }
      col.links.push({ label: item.label, href: item.href });
    }

    const socials: SocialLink[] = social
      ? Object.entries(social)
          .filter(([k, v]) => SOCIAL_ICONS[k] && v)
          .map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), href: v, Icon: SOCIAL_ICONS[k] }))
      : fallbackSocials;

    return {
      columns: columns.length > 0 ? columns : fallbackColumns,
      socials: socials.length > 0 ? socials : fallbackSocials,
    };
  } catch (err) {
    console.error("SiteFooter: DB read failed, using static config:", err);
    return { columns: fallbackColumns, socials: fallbackSocials };
  }
}

export async function SiteFooter() {
  const { columns, socials } = await getFooterData();
  return (
    <footer data-stage className="void-mesh border-t border-white/8 text-canvas">
      <div className="mx-auto max-w-[78rem] px-5 sm:px-8">
        {/* Closing statement */}
        <Reveal stagger={0.1} className="grid gap-10 border-b border-white/10 py-16 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div data-reveal>
            <p className="eyebrow text-ink-400">Season three · applications live</p>
            <h2 className="display mt-5 text-5xl text-canvas sm:text-6xl">
              Argue <em className="text-yellow">better.</em>
              <br />
              Win <em className="text-teal">louder.</em>
            </h2>
          </div>
          <div data-reveal className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <Link
              href="/signup"
              className="group flex items-center justify-between gap-3 rounded-full bg-canvas py-2 pl-6 pr-2 text-[15px] font-semibold text-stage active:scale-[0.97] sm:justify-start"
            >
              Sign up
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
            <Link
              href="/events"
              className="rounded-full px-6 py-3 text-center text-[15px] font-medium text-ink-200 ring-1 ring-inset ring-white/12 transition-colors hover:bg-white/5 hover:text-canvas"
            >
              Browse events
            </Link>
          </div>
        </Reveal>

        {/* Link columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo variant="stage" />
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              A youth forum for debate, public speaking, and the founders who come
              out of those rooms. Run live, scored fast, judged for real.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="press inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset ring-ink-700 text-ink-200 transition-colors hover:bg-ink-800 hover:text-canvas"
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-ink-300 transition-colors hover:text-canvas"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Legal strap */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">
            © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.city} ·{" "}
            {siteConfig.season}
          </p>
          <div className="flex items-center gap-2 text-ink-500">
            <Equalizer className="h-3 text-yellow" />
            <span className="font-mono">orvox.in/{siteConfig.season.toLowerCase()}</span>
          </div>
          <div className="flex gap-5">
            <Link href="/about" className="hover:text-ink-200">Privacy</Link>
            <Link href="/about" className="hover:text-ink-200">Terms</Link>
            <Link href="/contact" className="hover:text-ink-200">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
