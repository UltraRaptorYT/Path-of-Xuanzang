"use client";

import { useEffect } from "react";
import { station1Rounds } from "@/data/station1";
import type { VoteRecord } from "@/data/voteStorage";
import { useGameStore } from "@/store/gameStore";

function exportVoteRecords(records: VoteRecord[]) {
  const columns = [
    "session_id",
    "recorded_at",
    "round_number",
    "round_id",
    "question_zh",
    "question_en",
    "left_count",
    "right_count",
    "selected_side",
    "selected_choice_zh",
    "selected_choice_en",
    "correct",
  ] as const;
  const cell = (value: string | number | boolean | null) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines = [
    columns.map(cell).join(","),
    ...records.map((record) => [
      record.sessionId,
      record.recordedAt,
      record.roundNumber,
      record.roundId,
      record.questionZh,
      record.questionEn,
      record.leftCount,
      record.rightCount,
      record.selectedSide,
      record.selectedChoiceZh,
      record.selectedChoiceEn,
      record.correct,
    ].map(cell).join(",")),
  ];
  const file = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `station1-votes-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function OperatorOverlay({ videoStatus, cameraStatus }: { videoStatus: string; cameraStatus: string }) {
  const state = useGameStore();
  useEffect(() => {
    if (state.operatorOpen) void state.refreshVoteRecords();
  }, [state.operatorOpen, state.refreshVoteRecords]);

  if (!state.operatorOpen) return null;

  return (
    <aside className="operator-overlay" aria-label="Operator controls">
      <header><span>STATION 1</span><strong>OPERATOR</strong></header>
      <dl>
        <div><dt>SCENE</dt><dd>{state.currentScene}</dd></div>
        <div><dt>ROUND</dt><dd>{Math.min(state.currentRound + 1, station1Rounds.length)} / {station1Rounds.length}</dd></div>
        <div><dt>SELECTED</dt><dd>{state.selectedSide?.toUpperCase() ?? "NONE"}</dd></div>
        <div><dt>VIDEO</dt><dd>{videoStatus}</dd></div>
        <div><dt>CAMERA</dt><dd>{cameraStatus}</dd></div>
        <div><dt>GLOBAL ROUNDS</dt><dd>{state.voteRecords.length}</dd></div>
        <div><dt>VOTE SYNC</dt><dd>{state.voteSyncStatus.toUpperCase()}</dd></div>
      </dl>
      <button
        className="vote-export"
        type="button"
        disabled={state.voteSyncStatus === "loading" || state.voteSyncStatus === "saving"}
        onClick={async () => {
          const records = await state.refreshVoteRecords();
          if (records) exportVoteRecords(records);
        }}
      >
        EXPORT VOTES CSV
      </button>
      {state.voteSyncError && <p className="vote-sync-error" role="status">{state.voteSyncError}</p>}
      <div className="operator-keys">
        <span>LEFT OPTION A</span><span>RIGHT OPTION B</span><span>SPACE LOCK</span>
        <span>ENTER NEXT</span><span>R REPLAY</span><span>ESC RESET</span>
      </div>
      <p>O · CLOSE HUD</p>
    </aside>
  );
}
