import { JudgeShell } from "@/components/app/judge-shell";
import { getJudgeProfile, requireAccount } from "@/lib/repo";

export default async function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require a signed-in session to reach the judge area. (Judge-specific role
  // gating should be added when a real judge identity model lands.)
  await requireAccount();
  const judge = await getJudgeProfile();
  const assigned = judge.rounds.filter((r) => r.status !== "submitted").length;
  return (
    <JudgeShell
      user={{ name: judge.name, role: judge.accreditation, accent: "teal" }}
      notifications={assigned}
    >
      {children}
    </JudgeShell>
  );
}
