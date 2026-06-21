import "server-only";
import { siteConfig } from "@/lib/site";

/**
 * Transactional email sender.
 *
 * The project has no mail provider wired yet, so this is a single integration
 * point: plug Resend / Postmark / SES here and every auth email (verification,
 * password reset) flows through it. Until then it logs the link server-side so
 * the flows are testable, and `sent` reflects whether a real send happened.
 *
 * To enable real sending, set RESEND_API_KEY (and EMAIL_FROM) and implement the
 * marked block — no caller changes required.
 */
export interface AuthEmail {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
}

export async function sendAuthEmail(email: AuthEmail): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || `no-reply@${new URL(siteConfig.url).hostname}`;

  if (!apiKey) {
    // No provider configured — log the actionable link for local/testing use.
    console.warn(
      `[email:not-sent] to=${email.to} subject="${email.subject}" link=${email.actionUrl}`,
    );
    return { sent: false };
  }

  try {
    // ---- Real send (Resend example). Swap for your provider as needed. -----
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: email.to,
        subject: email.subject,
        html: `<h2>${email.heading}</h2><p>${email.body}</p><p><a href="${email.actionUrl}">${email.actionLabel}</a></p><p style="color:#888;font-size:12px">If you didn't request this, you can ignore this email.</p>`,
      }),
    });
    if (!res.ok) {
      console.error("sendAuthEmail: provider error", res.status, await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("sendAuthEmail failed:", err);
    return { sent: false };
  }
}
