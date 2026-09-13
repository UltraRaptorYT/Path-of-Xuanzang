"use client";

import { motion } from "motion/react";
import { journeyStops } from "@/data/station1";

export function JourneyMap({ progress, onRestart }: { progress: number; onRestart: () => void }) {
  return (
    <motion.section
      className="scene journey-scene paper-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <header className="journey-header">
        <p className="eyebrow">真正的西游 · THE JOURNEY BEGINS</p>
        <h2>踏上玄奘大师的旅程</h2>
        <p>Walk the path of Master Xuanzang and uncover his extraordinary journey.</p>
      </header>

      <div className="scroll-map" aria-label="Journey route from Chang'an to India">
        <svg className="route-line" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M 45 175 C 170 20, 270 235, 420 112 S 650 58, 760 155 S 900 210, 955 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="13 14"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
        </svg>
        <div className="stops">
          {journeyStops.map((stop, index) => {
            const active = index <= progress;
            return (
              <motion.div
                key={stop.en}
                className={`stop stop-${index} ${active ? "active" : ""}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + index * 0.2 }}
              >
                <span className="stop-dot" />
                <strong>{stop.zh}</strong>
                <small>{stop.en}</small>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          className="traveller-mark"
          initial={{ left: "4%", opacity: 0 }}
          animate={{ left: `${4 + Math.min(progress, 4) * 23}%`, opacity: 1 }}
          transition={{ delay: 1, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          行
        </motion.div>
      </div>

      <div className="journey-footer">
        <p><span>{progress}</span> JOURNEY POINT{progress === 1 ? "" : "S"}</p>
        <button type="button" onClick={onRestart}>重新开始 · RESTART</button>
        <small>ENTER · RETURN TO START</small>
      </div>
    </motion.section>
  );
}
