"use client";

import { motion } from "motion/react";
import type { CameraStatus, DetectedPlayer } from "@/hooks/usePoseController";

const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28],
] as const;

interface PosePresenceProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  players: DetectedPlayer[];
  visible: boolean;
  showPreview: boolean;
}

export function PosePresence({ videoRef, status, players, visible, showPreview }: PosePresenceProps) {
  return (
    <>
      <div className={showPreview ? "camera-debug-preview visible" : "camera-debug-preview"}>
        <video ref={videoRef} className="camera-source" muted playsInline aria-hidden={!showPreview} />
        <div className="camera-debug-label">
          <span className={status === "ready" ? "camera-live-dot" : ""} />
          CAMERA · {status.toUpperCase()}
        </div>
      </div>
      {visible && status !== "ready" && (
        <div className="camera-warning" role="status">
          CAMERA {status.toUpperCase()} · OPERATOR FALLBACK ACTIVE
        </div>
      )}
      {visible && status === "ready" && players.length > 0 && (
        <motion.svg
          className="ink-people"
          viewBox="0 0 1000 560"
          preserveAspectRatio="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-hidden="true"
        >
          {players.map((player) => (
            <g key={player.id} className="ink-person">
              {CONNECTIONS.map(([from, to]) => {
                const a = player.landmarks[from];
                const b = player.landmarks[to];
                if (!a || !b) return null;
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={(1 - a.x) * 1000}
                    y1={a.y * 560}
                    x2={(1 - b.x) * 1000}
                    y2={b.y * 560}
                  />
                );
              })}
              {player.landmarks[0] && (
                <circle
                  cx={(1 - player.landmarks[0].x) * 1000}
                  cy={player.landmarks[0].y * 560}
                  r="14"
                />
              )}
            </g>
          ))}
        </motion.svg>
      )}
    </>
  );
}
