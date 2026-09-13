"use client";

import { motion } from "motion/react";
import type { Side, StationRound } from "@/data/station1";
import { ChoiceZone } from "./ChoiceZone";
import { Countdown } from "./Countdown";

interface QuestionSceneProps {
  round: StationRound;
  roundNumber: number;
  selected: Side | null;
  countdown: number;
  isCounting: boolean;
  leftCount: number;
  rightCount: number;
  sideProgress: number;
}

export function QuestionScene({
  round,
  roundNumber,
  selected,
  countdown,
  isCounting,
  leftCount,
  rightCount,
  sideProgress,
}: QuestionSceneProps) {
  return (
    <motion.section
      className="scene question-scene paper-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65 }}
    >
      <header className="question-header">
        <p className="round-label">第 {roundNumber} 问 · QUESTION {roundNumber}</p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.7 }}
        >
          {round.questionZh}
        </motion.h2>
        <p className="question-en">{round.questionEn}</p>
      </header>

      <div className="choices">
        <ChoiceZone side="left" selected={selected} count={leftCount} />
        <div className="ink-divider" aria-hidden="true"><span /></div>
        <ChoiceZone side="right" selected={selected} count={rightCount} />
      </div>

      <div className="question-footer">
        <div>
          <p>请选择你的位置</p>
          <span>CHOOSE YOUR SIDE</span>
        </div>
        {isCounting && <Countdown value={countdown} />}
        <div className={selected ? "lock-hint ready" : "lock-hint"}>
          <p>{selected ? "保持位置 · HOLD YOUR SIDE" : "走到左边或右边 · MOVE LEFT OR RIGHT"}</p>
          <span><i style={{ transform: `scaleX(${sideProgress})` }} /></span>
        </div>
      </div>
    </motion.section>
  );
}
