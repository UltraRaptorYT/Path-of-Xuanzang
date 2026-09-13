"use client";

import { motion } from "motion/react";
import type { Side } from "@/data/station1";

interface ChoiceZoneProps {
  side: Side;
  selected: Side | null;
  count: number;
}

export function ChoiceZone({ side, selected, count }: ChoiceZoneProps) {
  const active = selected === side;
  const dimmed = selected !== null && !active;
  const left = side === "left";

  return (
    <motion.div
      className={`choice-zone ${side} ${active ? "selected" : ""} ${dimmed ? "dimmed" : ""}`}
      animate={{ scale: active ? 1.025 : 1, opacity: dimmed ? 0.46 : 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-label={left ? "Select yes, left side" : "Select no, right side"}
    >
      <span className="direction">{left ? "← 站到左边" : "站到右边 →"}</span>
      <span className="direction-en">{left ? "STAND LEFT" : "STAND RIGHT"}</span>
      <span className="choice-zh">{left ? "是" : "否"}</span>
      <span className="choice-en">{left ? "YES" : "NO"}</span>
      <span className="ink-underline" />
      <span className="people-count"><b>{count}</b> {count === 1 ? "PERSON" : "PEOPLE"}</span>
      {active && <span className="selected-mark">已选择 · SELECTED</span>}
    </motion.div>
  );
}
