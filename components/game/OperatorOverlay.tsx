"use client";

import { station1Rounds } from "@/data/station1";
import { useGameStore } from "@/store/gameStore";

export function OperatorOverlay({ videoStatus, cameraStatus }: { videoStatus: string; cameraStatus: string }) {
  const state = useGameStore();
  if (!state.operatorOpen) return null;

  return (
    <aside className="operator-overlay" aria-label="Operator controls">
      <header><span>STATION 1</span><strong>OPERATOR</strong></header>
      <dl>
        <div><dt>SCENE</dt><dd>{state.currentScene}</dd></div>
        <div><dt>ROUND</dt><dd>{Math.min(state.currentRound + 1, station1Rounds.length)} / {station1Rounds.length}</dd></div>
        <div><dt>SELECTED</dt><dd>{state.selectedSide?.toUpperCase() ?? "NONE"}</dd></div>
        <div><dt>SCORE</dt><dd>{state.score}</dd></div>
        <div><dt>VIDEO</dt><dd>{videoStatus}</dd></div>
        <div><dt>CAMERA</dt><dd>{cameraStatus}</dd></div>
      </dl>
      <div className="operator-keys">
        <span>LEFT YES</span><span>RIGHT NO</span><span>SPACE LOCK</span>
        <span>ENTER NEXT</span><span>R REPLAY</span><span>ESC RESET</span>
      </div>
      <p>O · CLOSE HUD</p>
    </aside>
  );
}
