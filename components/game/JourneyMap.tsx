"use client";

import { motion } from "motion/react";

export function JourneyMap({
  secondsRemaining,
  onRestart,
}: {
  secondsRemaining: number;
  onRestart: () => void;
}) {
  return (
    <motion.section
      className="scene journey-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="ending-map-video-frame">
        <video
          className="ending-map-video"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/videos/optimized/Ending%20Map-1080p.mp4" type="video/mp4" />
        </video>
      </div>

      <header className="journey-header">
        <h2>玄奘之路</h2>
        <p>WALK THE PATH OF MASTER XUANZANG</p>
      </header>

      <div className="journey-footer">
        <button type="button" onClick={onRestart}>重新开始 · RESTART</button>
      </div>
      <div className="restart-countdown" role="timer" aria-label={`Restarting in ${secondsRemaining} seconds`}>
        <span className="restart-countdown-ring" style={{ "--restart-progress": `${(secondsRemaining / 10) * 360}deg` } as React.CSSProperties}>
          {secondsRemaining}
        </span>
      </div>
    </motion.section>
  );
}
