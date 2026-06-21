import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a link to reset your ORVOX password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell heading="Reset your password." sub="Enter your email and we'll send a secure reset link.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
