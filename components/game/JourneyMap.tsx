"use client";

import { motion } from "motion/react";

const journey = [
  { zh: "洛阳", en: "LUOYANG · START", position: "journey-node-0" },
  { zh: "长安", en: "CHANG’AN", position: "journey-node-1" },
  { zh: "四川", en: "SICHUAN", position: "journey-node-2" },
  { zh: "长安", en: "CHANG’AN · RETURN", position: "journey-node-3" },
  { zh: "印度", en: "INDIA", position: "journey-node-4" },
];

export function JourneyMap({
  secondsRemaining,
  onRestart,
}: {
  secondsRemaining: number;
  onRestart: () => void;
}) {
  return (
    <motion.section
      className="scene journey-scene paper-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <header className="journey-header">
        <p className="eyebrow">玄奘西行图 · XUANZANG’S JOURNEY WEST</p>
        <h2>洛阳 → 长安 → 四川 → 长安 → 印度</h2>
        <p>WALK THE PATH OF MASTER XUANZANG</p>
      </header>

      <div
        className="scroll-map simple-journey-map"
        aria-label="A simple map of Xuanzang’s journey from Luoyang to Chang’an, Sichuan, back to Chang’an, and India"
      >
        <svg className="route-line" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M 42 365 C 115 220, 165 155, 250 175 S 410 320, 500 300 S 635 135, 720 175 S 835 390, 900 325 C 940 270, 944 175, 965 105"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.2, ease: "easeInOut" }}
          />
        </svg>

        {journey.map((stop, index) => (
          <motion.div
            key={`${stop.position}-${stop.en}`}
            className={`journey-node ${stop.position}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + index * 0.16, duration: 0.4 }}
          >
            <span className="journey-node-dot" aria-hidden="true" />
            <strong>{stop.zh}</strong>
            <small>{stop.en}</small>
          </motion.div>
        ))}

        <span className="journey-seal" aria-hidden="true">行</span>
      </div>

      <div className="journey-footer">
        <button type="button" onClick={onRestart}>重新开始 · RESTART</button>
        <div className="restart-countdown" role="timer" aria-label={`Automatic restart in ${secondsRemaining} seconds`}>
          <span className="restart-countdown-ring" style={{ "--restart-progress": `${(secondsRemaining / 15) * 360}deg` } as React.CSSProperties}>
            {secondsRemaining}
          </span>
          <small>AUTO RESTART</small>
        </div>
      </div>
    </motion.section>
  );
}
