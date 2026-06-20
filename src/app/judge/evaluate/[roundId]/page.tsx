import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScoreSheet } from "@/components/judge/score-sheet";
import { getJudgeProfile, getJudgeRound } from "@/lib/repo";

export const metadata: Metadata = { title: "Score round", robots: { index: false } };

export async function generateStaticParams() {
  const judge = await getJudgeProfile();
  return judge.rounds.map((r) => ({ roundId: r.id }));
}

export default async function EvaluatePage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const { roundId } = await params;
  const round = await getJudgeRound(roundId);
  if (!round) notFound();

  return <ScoreSheet round={round} readOnly={round.status === "submitted"} />;
}
