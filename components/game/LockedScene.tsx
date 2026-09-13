"use client";

import { motion } from "motion/react";
import type { Side, StationRound } from "@/data/station1";

export function LockedScene({ round, selected }: { round: StationRound; selected: Side }) {
  const yes = selected === "left";
  return (
    <motion.section
      className={`scene locked-scene paper-surface ${yes ? "choice-left" : "choice-right"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="ink-bloom"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.92 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="locked-copy"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.65 }}
      >
        <p>你们的选择 · YOUR CHOICE</p>
        <strong>{yes ? "是" : "否"}</strong>
        <span>{yes ? "YES" : "NO"}</span>
        <div className="stamp">定</div>
      </motion.div>
      {round.type === "poll" && <p className="continue-hint">即将继续 · CONTINUING THE JOURNEY</p>}
    </motion.section>
  );
}
