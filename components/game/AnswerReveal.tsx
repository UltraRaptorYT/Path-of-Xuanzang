"use client";

import { motion } from "motion/react";
import type { Side, StationRound } from "@/data/station1";
import type { VoteSummary } from "@/data/voteStorage";

interface AnswerRevealProps {
  round: StationRound;
  selected: Side | null;
  summary: VoteSummary | null;
}

export function AnswerReveal({ round, selected, summary }: AnswerRevealProps) {
  const answerSide = round.correctSide ?? selected;
  const answerChoice = answerSide ? round.choices[answerSide] : null;
  const answerLetter = answerSide === "left" ? "A" : "B";
  const isCorrect = round.correctSide != null && selected === round.correctSide;
  const selectedLetter = selected === "left" ? "A" : "B";
  const sameCount = selected === "left" ? summary?.leftCount : summary?.rightCount;
  const samePercent = summary?.totalCount
    ? Math.round(((sameCount ?? 0) / summary.totalCount) * 1000) / 10
    : null;

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
        className="reveal-content reveal-education"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.75 }}
      >
        <p className="reveal-result">
          {round.correctSide
            ? isCorrect ? "答对了 · CORRECT" : "答案揭晓 · THE ANSWER"
            : "投票完成 · VOTE RECORDED"}
        </p>

        {answerChoice && (
          <div className="answer-seal reveal-answer-seal">
            <span>{answerLetter}</span>
            <small>{round.correctSide ? "ANSWER" : "YOUR CHOICE"}</small>
          </div>
        )}

        {round.correctSide && selected && (
          <p className="reveal-your-choice">
            YOUR CHOICE {selectedLetter}{isCorrect ? " · CORRECT" : ` · THE ANSWER IS ${answerLetter}`}
          </p>
        )}
        {!round.correctSide && selected && round.revealZh && (
          <p className="reveal-your-choice">YOUR CHOICE · {round.choices[selected].zh} / {round.choices[selected].en}</p>
        )}

        {round.correctSide && samePercent !== null && (
          <p className="crowd-result">{samePercent.toFixed(1)}% OF PEOPLE CHOSE THE SAME ANSWER AS YOU</p>
        )}

        <h2>{round.revealZh ?? answerChoice?.zh}</h2>
        <p className="reveal-explanation">{round.revealEn ?? answerChoice?.en}</p>
      </motion.div>
      <p className="continue-hint">即将继续 · CONTINUING THE JOURNEY</p>
    </motion.section>
  );
}
