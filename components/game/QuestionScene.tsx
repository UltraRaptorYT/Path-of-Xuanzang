"use client";

import { motion } from "motion/react";
import type { Side, StationRound } from "@/data/station1";
import type { VoteSummary } from "@/data/voteStorage";
import { ChoiceZone } from "./ChoiceZone";
import { Countdown } from "./Countdown";

interface QuestionSceneProps {
  round: StationRound;
  roundNumber: number;
  totalRounds: number;
  selected: Side | null;
  showGlobalResults: boolean;
  globalVotes: VoteSummary | null;
  countdown: number;
  isCounting: boolean;
  leftCount: number;
  rightCount: number;
  sideProgress: number;
}

export function QuestionScene({
  round,
  roundNumber,
  totalRounds,
  selected,
  showGlobalResults,
  globalVotes,
  countdown,
  isCounting,
  leftCount,
  rightCount,
  sideProgress,
}: QuestionSceneProps) {
  const globalTotal = globalVotes?.totalCount ?? 0;
  const leftGlobalPercent = globalVotes && globalTotal > 0
    ? Math.round((globalVotes.leftCount / globalTotal) * 1000) / 10
    : null;
  const rightGlobalPercent = leftGlobalPercent === null ? null : 100 - leftGlobalPercent;

  return (
    <motion.section
      className="scene question-scene paper-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65 }}
    >
      <header className="question-header">
        <div className="question-kicker">
          <span>第一站 · STATION ONE</span>
          <i aria-hidden="true" />
          <span>第 {roundNumber} 问 · ROUND {String(roundNumber).padStart(2, "0")} / {String(totalRounds).padStart(2, "0")}</span>
        </div>
        <div className="round-progress" aria-label={`Round ${roundNumber} of ${totalRounds}`}>
          {Array.from({ length: totalRounds }, (_, index) => (
            <span
              key={index}
              className={index + 1 === roundNumber ? "current" : index + 1 < roundNumber ? "complete" : ""}
            />
          ))}
        </div>
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
        <ChoiceZone
          side="left"
          choice={round.choices.left}
          selected={selected}
          count={leftCount}
          globalCount={globalVotes?.leftCount ?? 0}
          globalPercent={leftGlobalPercent}
          showGlobalResults={showGlobalResults}
        />
        <div className="ink-divider" aria-hidden="true"><span /></div>
        <ChoiceZone
          side="right"
          choice={round.choices.right}
          selected={selected}
          count={rightCount}
          globalCount={globalVotes?.rightCount ?? 0}
          globalPercent={rightGlobalPercent}
          showGlobalResults={showGlobalResults}
        />
      </div>

      <div className="question-footer">
        <div>
          <p>选择你的答案</p>
          <span>CHOOSE YOUR ANSWER</span>
        </div>
        {showGlobalResults ? (
          <motion.div
            key={globalVotes?.totalCount ?? "loading"}
            className="total-votes"
            aria-live="polite"
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <b>{globalVotes ? globalTotal.toLocaleString() : "—"}</b>
            <span>TOTAL VOTES</span>
          </motion.div>
        ) : isCounting ? <Countdown value={countdown} /> : null}
        <div className={selected ? "lock-hint ready" : "lock-hint"}>
          <p>{selected ? "保持位置 · HOLD YOUR SIDE" : "走到左边或右边 · MOVE LEFT OR RIGHT"}</p>
          <span><i style={{ transform: `scaleX(${sideProgress})` }} /></span>
        </div>
      </div>
    </motion.section>
  );
}
