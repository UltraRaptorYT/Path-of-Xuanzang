import type { Side } from "@/data/station1";

export interface VoteRecord {
  sessionId: string;
  recordedAt: string;
  roundId: string;
  roundNumber: number;
  questionZh: string;
  questionEn: string;
  leftCount: number;
  rightCount: number;
  selectedSide: Side;
  selectedChoiceZh: string;
  selectedChoiceEn: string;
  correct: boolean | null;
}

export interface VoteSummary {
  leftCount: number;
  rightCount: number;
  totalCount: number;
}

export async function saveVoteRecord(record: VoteRecord) {
  const response = await fetch("/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error ?? "Could not save vote to the global database.");
  }
}

export async function fetchVoteRecords(): Promise<VoteRecord[]> {
  const response = await fetch("/api/votes", { cache: "no-store" });
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error ?? "Could not load votes from the global database.");
  }

  return await response.json() as VoteRecord[];
}

export async function fetchVoteSummary(roundId: string): Promise<VoteSummary> {
  const query = new URLSearchParams({ roundId });
  const response = await fetch(`/api/votes?${query}`, { cache: "no-store" });
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error ?? "Could not load the global vote total.");
  }

  return await response.json() as VoteSummary;
}
