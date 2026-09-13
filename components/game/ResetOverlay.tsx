"use client";

import { motion } from "motion/react";

export function ResetOverlay({ onReset, onCancel }: { onReset: () => void; onCancel: () => void }) {
  return (
    <motion.div className="reset-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="reset-panel" initial={{ scale: 0.9, y: 18 }} animate={{ scale: 1, y: 0 }}>
        <div className="reset-symbol">返</div>
        <h2>重置体验？</h2>
        <p>RESET THE STATION?</p>
        <div>
          <button type="button" onClick={onReset}>ENTER · RESET</button>
          <button type="button" onClick={onCancel}>ESC · CANCEL</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
