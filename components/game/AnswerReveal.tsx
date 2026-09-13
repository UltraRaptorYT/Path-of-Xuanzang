"use client";

import { motion } from "motion/react";
import type { Side, StationRound } from "@/data/station1";

export function AnswerReveal({ round, selected }: { round: StationRound; selected: Side | null }) {
  const correct = selected === round.correctSide;
  return (
    <motion.section
      className="scene reveal-scene paper-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        className="reveal-brush"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="reveal-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.75 }}
      >
        <p className="reveal-result">{correct ? "答对了 · CORRECT" : "答案揭晓 · THE ANSWER"}</p>
        <div className="answer-seal"><span>是</span><small>YES</small></div>
        <h2>{round.revealZh}</h2>
        <p>{round.revealEn}</p>
        <div className="journey-point">
          {correct ? "+1" : "0"} <span>JOURNEY POINT</span>
        </div>
      </motion.div>
      <p className="continue-hint">即将继续 · CONTINUING THE JOURNEY</p>
    </motion.section>
  );
}
