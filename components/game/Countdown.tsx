"use client";

import { AnimatePresence, motion } from "motion/react";

export function Countdown({ value }: { value: number }) {
  return (
    <div className="countdown" aria-live="polite" aria-label={`${value} seconds`}>
      <div className="countdown-ring" style={{ "--progress": `${value * 72}deg` } as React.CSSProperties} />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 1.55, filter: "blur(7px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.65 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          {value || "定"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
