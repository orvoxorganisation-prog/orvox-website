import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your ORVOX account and register for the season.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell heading="Get your seat." sub="One account for every event, result, and resource.">
      <SignupForm />
    </AuthShell>
  );
}
