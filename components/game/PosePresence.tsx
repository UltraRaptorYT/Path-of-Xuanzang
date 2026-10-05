"use client";

import { motion } from "motion/react";
import type { CameraStatus, DetectedPlayer } from "@/hooks/usePoseController";

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
              <rect
                x={(1 - player.box.x - player.box.width) * 1000}
                y={player.box.y * 560}
                width={player.box.width * 1000}
                height={player.box.height * 560}
                rx="10"
              />
            </g>
          ))}
        </motion.svg>
      )}
    </>
  );
}
