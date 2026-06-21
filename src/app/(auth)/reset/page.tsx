import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your ORVOX account.",
  robots: { index: false, follow: false },
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell heading="Link not valid." sub="This reset link is missing or malformed.">
        <p className="text-sm text-ink-400">
          Request a fresh link from the{" "}
          <Link href="/forgot-password" className="font-medium text-canvas underline-offset-4 hover:underline">
            password reset page
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell heading="Set a new password." sub="Pick something strong — at least 8 characters with a letter and a number.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
