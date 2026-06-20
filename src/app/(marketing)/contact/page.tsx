import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { InstagramIcon, XIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/social-icons";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with ORVOX — hosting, judging, press, or anything else.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Contact ORVOX",
    description: "Get in touch with ORVOX — hosting, judging, press, or anything else.",
  },
};

const socials = [
  { label: "Instagram", href: siteConfig.socials.instagram, Icon: InstagramIcon },
  { label: "Twitter", href: siteConfig.socials.twitter, Icon: XIcon },
  { label: "YouTube", href: siteConfig.socials.youtube, Icon: YoutubeIcon },
  { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: LinkedinIcon },
];

const channels = [
  {
    Icon: Mail,
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  { Icon: MapPin, label: "Base", value: `${siteConfig.city}, India` },
  { Icon: Clock, label: "Reply time", value: "Within a day or two" },
];

export default function ContactPage() {
  return (
    <div className="text-canvas">
      <WebPageJsonLd
        path="/contact"
        title="Contact ORVOX"
        description="Get in touch with ORVOX — hosting, judging, press, or anything else."
        type="ContactPage"
        breadcrumb={[{ name: "Contact", href: "/contact" }]}
      />
      <BreadcrumbJsonLd items={[{ name: "Contact", href: "/contact" }]} />
      <PageHeader
        tint="rose"
        title={
          <>
            Say <em className="text-rose-deep">it.</em>
          </>
        }
        description="Hosting a competition, judging, press, or just have a question? We actually read these."
      />

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_340px] lg:gap-16">
        <Reveal start="top 95%">
          <ContactForm />
        </Reveal>

        {/* The switchboard */}
        <aside className="space-y-8">
          <Reveal y={26} stagger={0.08} className="rounded-feature panel p-6" start="top 95%">
            <Eyebrow>Direct</Eyebrow>
            <ul className="mt-2 divide-y divide-white/8">
              {channels.map(({ Icon, label, value, href }) => (
                <li key={label} data-reveal className="flex items-start gap-3.5 py-4 last:pb-1">
                  <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-400" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-medium text-canvas">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-ink-400 transition-colors hover:text-canvas">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-ink-400">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal y={20}>
            <Eyebrow>Follow</Eyebrow>
            <div className="mt-4 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="press inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-300 ring-1 ring-inset ring-white/15 transition-colors hover:bg-canvas hover:text-ink-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </Reveal>
        </aside>
      </Container>
    </div>
  );
}
