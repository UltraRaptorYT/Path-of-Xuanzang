"use client";

import { create } from "zustand";
import type { Side } from "@/data/station1";

export type GameScene =
  | "start"
  | "video"
  | "question"
  | "countdown"
  | "locked"
  | "reveal"
  | "finalVideo"
  | "journey";

interface GameState {
  currentScene: GameScene;
  currentRound: number;
  selectedSide: Side | null;
  score: number;
  journeyProgress: number;
  countdown: number;
  operatorOpen: boolean;
  resetOpen: boolean;
  videoKey: number;
  inputMode: "operator" | "camera";
  setScene: (scene: GameScene) => void;
  selectSide: (side: Side | null) => void;
  setCountdown: (value: number) => void;
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
  score: 0,
  journeyProgress: 0,
  countdown: 5,
  operatorOpen: false,
  resetOpen: false,
  videoKey: 0,
  inputMode: "camera" as const,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  setScene: (currentScene) => set({ currentScene }),
  selectSide: (selectedSide) => set({ selectedSide }),
  setCountdown: (countdown) => set({ countdown }),
  lockChoice: () =>
    set((state) => {
      if (!state.selectedSide) return state;
      const isCorrect =
        state.currentRound === 1 && state.selectedSide === "left";
      return {
        currentScene: "locked",
        score: isCorrect ? state.score + 1 : state.score,
        journeyProgress: isCorrect
          ? state.journeyProgress + 1
          : state.journeyProgress,
      };
    }),
  advanceRound: () =>
    set((state) => ({
      currentRound: state.currentRound + 1,
      currentScene: "video",
      selectedSide: null,
      countdown: 5,
    })),
  toggleOperator: () =>
    set((state) => ({ operatorOpen: !state.operatorOpen })),
  setResetOpen: (resetOpen) => set({ resetOpen }),
  replayVideo: () => set((state) => ({ videoKey: state.videoKey + 1 })),
  reset: () => set({ ...initialState, videoKey: Date.now() }),
}));
