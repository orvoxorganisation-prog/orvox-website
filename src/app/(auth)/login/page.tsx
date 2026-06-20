import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your ORVOX dashboard.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell heading="Log back in." sub="Your rounds, results, and feedback are waiting.">
      <LoginForm />
    </AuthShell>
  );
}
