"use client";

import { useEffect } from "react";
import { station1Rounds } from "@/data/station1";
import { useGameStore } from "@/store/gameStore";

export function useKeyboardControls() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const state = useGameStore.getState();

      if (state.resetOpen) {
        if (event.key === "Escape") state.setResetOpen(false);
        if (event.key === "Enter") state.reset();
        return;
      }

      if (event.key.toLowerCase() === "o") {
        state.toggleOperator();
        return;
      }

      if (event.key === "Escape" && state.currentScene !== "start") {
        state.setResetOpen(true);
        return;
      }

      if (event.key.toLowerCase() === "r" &&
          (state.currentScene === "video" || state.currentScene === "finalVideo")) {
        state.replayVideo();
        return;
      }

      if (state.currentScene === "question" || state.currentScene === "countdown") {
        if (event.key === "ArrowLeft") state.selectSide("left");
        if (event.key === "ArrowRight") state.selectSide("right");
        if (event.code === "Space") {
          event.preventDefault();
          state.lockChoice();
        }
        return;
      }

      if (event.key !== "Enter") return;

      if (state.currentScene === "start") {
        state.setScene("video");
        void document.documentElement.requestFullscreen?.().catch(() => undefined);
      } else if (state.currentScene === "video") {
        state.setScene("question");
      } else if (state.currentScene === "locked") {
        if (station1Rounds[state.currentRound]?.type === "quiz") {
          state.setScene("reveal");
        } else {
          state.advanceRound();
        }
      } else if (state.currentScene === "reveal") {
        state.setScene("finalVideo");
      } else if (state.currentScene === "finalVideo") {
        state.setScene("journey");
      } else if (state.currentScene === "journey") {
        state.reset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
