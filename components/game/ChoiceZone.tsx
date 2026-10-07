"use client";

import { motion } from "motion/react";
import type { Side, StationChoice } from "@/data/station1";

interface ChoiceZoneProps {
  side: Side;
  choice: StationChoice;
  selected: Side | null;
  count: number;
  globalCount: number;
  globalPercent: number | null;
  showGlobalResults: boolean;
}

export function ChoiceZone({ side, choice, selected, count, globalCount, globalPercent, showGlobalResults }: ChoiceZoneProps) {
  const active = selected === side;
  const dimmed = selected !== null && !active;
  const left = side === "left";

  return (
    <motion.div
      className={`choice-zone ${side} text-center ${active ? "selected" : ""} ${dimmed ? "dimmed" : ""}`}
      animate={{ scale: active ? 1.025 : 1, opacity: dimmed ? 0.46 : 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-label={`Select ${choice.en}, ${left ? "left" : "right"} side`}
    >
      <span className="choice-index" aria-hidden="true">{left ? "A" : "B"}</span>
      <span className="direction">{left ? "← 站到左边" : "站到右边 →"}</span>
      <span className="direction-en">{left ? "STAND LEFT" : "STAND RIGHT"}</span>
      <span className="choice-zh">{choice.zh}</span>
      <span className="choice-en">{choice.en}</span>
      <span className="ink-underline" />
      {showGlobalResults && (
        <>
          <span className="global-votes" aria-live="polite">
            <b>{globalPercent === null ? "—" : `${globalPercent.toFixed(1)}%`}</b>
            <small>{globalCount.toLocaleString()} {globalCount === 1 ? "VOTE" : "VOTES"}</small>
          </span>
          <span className="people-count"><b>{count}</b> IN THIS ROOM</span>
        </>
      )}
      {active && <span className="selected-mark">已选择 · SELECTED</span>}
    </motion.div>
  );
}
