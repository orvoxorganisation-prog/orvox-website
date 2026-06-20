import { JudgeShell } from "@/components/app/judge-shell";
import { getJudgeProfile } from "@/lib/repo";

export default async function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
