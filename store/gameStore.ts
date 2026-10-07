"use client";

import { create } from "zustand";
import { station1Rounds, type Side } from "@/data/station1";
import { fetchVoteRecords, fetchVoteSummary, saveVoteRecord, type VoteRecord, type VoteSummary } from "@/data/voteStorage";

export type VoteSyncStatus = "idle" | "saving" | "synced" | "loading" | "error";

export type GameScene =
  | "start"
  | "video"
  | "question"
  | "countdown"
  | "locked"
  | "reveal"
  | "journey";

interface GameState {
  currentScene: GameScene;
  currentRound: number;
  selectedSide: Side | null;
  countdown: number;
  operatorOpen: boolean;
  resetOpen: boolean;
  videoKey: number;
  voteRecords: VoteRecord[];
  voteSummaries: Record<string, VoteSummary>;
  voteCounts: { left: number; right: number };
  sessionId: string | null;
  voteSyncStatus: VoteSyncStatus;
  voteSyncError: string | null;
  inputMode: "operator" | "camera";
  setScene: (scene: GameScene) => void;
  selectSide: (side: Side | null) => void;
  setCountdown: (value: number) => void;
  setVoteCounts: (left: number, right: number) => void;
  refreshVoteRecords: () => Promise<VoteRecord[] | null>;
  lockChoice: () => void;
  advanceRound: () => void;
  toggleOperator: () => void;
  setResetOpen: (open: boolean) => void;
  replayVideo: () => void;
  reset: () => void;
}

const initialState = {
  currentScene: "start" as GameScene,
  currentRound: 0,
  selectedSide: null,
  countdown: 5,
  operatorOpen: false,
  resetOpen: false,
  videoKey: 0,
  voteRecords: [],
  voteSummaries: {},
  voteCounts: { left: 0, right: 0 },
  sessionId: null,
  voteSyncStatus: "idle" as VoteSyncStatus,
  voteSyncError: null,
  inputMode: "camera" as const,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  setScene: (currentScene) => set({ currentScene }),
  selectSide: (selectedSide) => set({ selectedSide }),
  setCountdown: (countdown) => set({ countdown }),
  setVoteCounts: (left, right) =>
    set((state) => state.voteCounts.left === left && state.voteCounts.right === right
      ? state
      : { voteCounts: { left, right } }),
  refreshVoteRecords: async () => {
    set({ voteSyncStatus: "loading", voteSyncError: null });
    try {
      const voteRecords = await fetchVoteRecords();
      set({ voteRecords, voteSyncStatus: "synced", voteSyncError: null });
      return voteRecords;
    } catch (error) {
      set({
        voteSyncStatus: "error",
        voteSyncError: error instanceof Error ? error.message : "Could not load votes from Supabase.",
      });
      return null;
    }
  },
  lockChoice: () => {
    const state = get();
    if (!state.selectedSide) return;
    const round = station1Rounds[state.currentRound];
    if (!round) return;

    const isCorrect = round.correctSide === state.selectedSide;
    const selectedChoice = round.choices[state.selectedSide];
    const sessionId = state.sessionId ?? new Date().toISOString();
    const voteRecord: VoteRecord = {
      sessionId,
      recordedAt: new Date().toISOString(),
      roundId: round.id,
      roundNumber: state.currentRound + 1,
      questionZh: round.questionZh,
      questionEn: round.questionEn,
      leftCount: state.voteCounts.left,
      rightCount: state.voteCounts.right,
      selectedSide: state.selectedSide,
      selectedChoiceZh: selectedChoice.zh,
      selectedChoiceEn: selectedChoice.en,
      correct: round.correctSide ? isCorrect : null,
    };

    set((current) => ({
      currentScene: "locked",
      sessionId,
      voteSyncStatus: "saving",
      voteSyncError: null,
    }));

    void (async () => {
      let baseSummary = get().voteSummaries[round.id] ?? { leftCount: 0, rightCount: 0, totalCount: 0 };
      try {
        baseSummary = await fetchVoteSummary(round.id);
      } catch {
        // Use the last known totals if the fresh pre-save read is briefly unavailable.
      }

      const hasDetectedPeople = state.voteCounts.left + state.voteCounts.right > 0;
      const leftDelta = hasDetectedPeople ? state.voteCounts.left : state.selectedSide === "left" ? 1 : 0;
      const rightDelta = hasDetectedPeople ? state.voteCounts.right : state.selectedSide === "right" ? 1 : 0;
      const optimisticSummary = {
        leftCount: baseSummary.leftCount + leftDelta,
        rightCount: baseSummary.rightCount + rightDelta,
        totalCount: baseSummary.totalCount + leftDelta + rightDelta,
      };

      set((current) => ({
        voteSummaries: { ...current.voteSummaries, [round.id]: optimisticSummary },
      }));

      try {
        await saveVoteRecord(voteRecord);
        set((current) => ({
          voteSyncStatus: "synced",
          voteSyncError: null,
          voteRecords: current.voteRecords.some((record) =>
            record.sessionId === voteRecord.sessionId && record.roundId === voteRecord.roundId
          ) ? current.voteRecords : [voteRecord, ...current.voteRecords],
        }));

        try {
          const currentSummary = await fetchVoteSummary(round.id);
          set((current) => ({
            voteSummaries: { ...current.voteSummaries, [round.id]: currentSummary },
          }));
        } catch {
          // Keep the optimistic total if the post-save reconciliation read fails.
        }
      } catch (error: unknown) {
        set((current) => ({
          voteSyncStatus: "error",
          voteSyncError: error instanceof Error ? error.message : "Could not save vote to Supabase.",
          voteSummaries: { ...current.voteSummaries, [round.id]: baseSummary },
        }));
      }
    })();
  },
  advanceRound: () =>
    set((state) => {
      const nextRound = state.currentRound + 1;
      return {
        currentRound: nextRound,
        currentScene: nextRound < station1Rounds.length ? "video" : "journey",
        selectedSide: null,
        countdown: 5,
        voteCounts: { left: 0, right: 0 },
      };
    }),
  toggleOperator: () =>
    set((state) => ({ operatorOpen: !state.operatorOpen })),
  setResetOpen: (resetOpen) => set({ resetOpen }),
  replayVideo: () => set((state) => ({ videoKey: state.videoKey + 1 })),
  reset: () => set((state) => ({
    ...initialState,
    voteRecords: state.voteRecords,
    voteSummaries: state.voteSummaries,
    voteSyncStatus: state.voteSyncStatus,
    voteSyncError: state.voteSyncError,
    videoKey: Date.now(),
  })),
}));
