import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ORVOX collects, uses, retains, and protects your personal data — and the rights you have over it.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "21 June 2026";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-canvas">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-ink-300">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <WebPageJsonLd path="/privacy" title="Privacy Policy" description="How ORVOX handles your personal data." breadcrumb={[{ name: "Privacy", href: "/privacy" }]} />
      <BreadcrumbJsonLd items={[{ name: "Privacy", href: "/privacy" }]} />
      <PageHeader eyebrow="Legal" tint="teal" title="Privacy Policy" description={`How we collect, use, and protect your data. Last updated ${UPDATED}.`} />
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl space-y-10">
          <Block title="Who we are">
            <p>
              ORVOX ({siteConfig.legalName}) runs debate and public-speaking competitions. This policy explains what
              personal data we process when you use this site, register for events, or contact us.
            </p>
          </Block>

          <Block title="What we collect">
            <ul className="list-disc space-y-1.5 pl-5">
              <li><strong className="text-ink-100">Account details</strong> — your name, email, and (optionally) school when you sign up.</li>
              <li><strong className="text-ink-100">Registrations</strong> — the events you register for, plus the name, email, phone, school, category, and motivation you submit on the registration form.</li>
              <li><strong className="text-ink-100">Contact messages</strong> — anything you send through our contact form.</li>
              <li><strong className="text-ink-100">Technical data</strong> — IP address and browser user-agent, used for security (rate limiting, abuse prevention) and kept in audit logs.</li>
            </ul>
          </Block>

          <Block title="How we use it">
            <p>To run your account and event registrations, send you transactional emails (verification and password reset), respond to enquiries, keep the service secure, and meet our legal obligations. We do not sell your personal data.</p>
          </Block>

          <Block title="Cookies">
            <p>
              We use a small number of strictly-necessary cookies to keep you signed in and remember your registrations.
              These are essential for the site to function. We do not use advertising or third-party tracking cookies.
            </p>
          </Block>

          <Block title="Data retention">
            <p>We keep account and registration data for as long as your account is active. Security audit logs are retained for a limited period (by default 12 months) and then automatically deleted. One-time verification and reset tokens expire within minutes to hours.</p>
          </Block>

          <Block title="Your rights">
            <p>You can access, correct, export, or delete your personal data at any time:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><strong className="text-ink-100">Export</strong> — download everything tied to your account from your <Link href="/dashboard/settings" className="text-teal underline-offset-4 hover:underline">account settings</Link>.</li>
              <li><strong className="text-ink-100">Deletion</strong> — delete your account and all associated registrations from the same page. This is immediate and irreversible.</li>
              <li><strong className="text-ink-100">Other requests</strong> — email us and we will action any access or correction request.</li>
            </ul>
          </Block>

          <Block title="Contact">
            <p>
              Questions about this policy or your data? Email{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-teal underline-offset-4 hover:underline">{siteConfig.email}</a>.
            </p>
          </Block>
        </div>
      </Container>
    </>
  );
}
