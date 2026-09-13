"use client";

import { motion } from "motion/react";
import Image from "next/image";
import type { CameraStatus } from "@/hooks/usePoseController";

interface StartSceneProps {
  cameraStatus: CameraStatus;
  poseProgress: number;
  onRetryCamera: () => void;
  onFallbackStart: () => void;
}

export function StartScene({ cameraStatus, poseProgress, onRetryCamera, onFallbackStart }: StartSceneProps) {
  return (
    <motion.section
      className="scene start-scene paper-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.8 }}
    >
      <div className="mist mist-one" />
      <div className="mist mist-two" />
      <motion.div
        className="start-copy"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.25 }}
      >
        <p className="eyebrow">第一站 · STATION ONE</p>
        <h1><span>玄奘</span>之路</h1>
        <p className="title-en">THE PATH OF XUANZANG</p>
        <div className="brush-rule" />
        <p className="opening-line">从神话，走向一段真实的旅程</p>
        <p className="opening-en">Step beyond the legend. Discover the true journey.</p>
        {cameraStatus === "ready" ? (
          <div className="start-pose-control">
            <div className="pose-glyph" aria-hidden="true">
              <Image
                src="/icons/person-arms-raised.svg"
                alt=""
                width={82}
                height={82}
                priority
              />
            </div>
            <div className="pose-copy">
              <strong>举起双手，保持姿势</strong>
              <span>RAISE BOTH HANDS &amp; HOLD TO BEGIN</span>
            </div>
            <div className="pose-hold"><i style={{ transform: `scaleX(${poseProgress})` }} /></div>
          </div>
        ) : (
          <div className="camera-setup">
            <p>{cameraStatus === "loading" ? "正在唤醒灵镜 · AWAKENING CAMERA" : "需要摄像头来感应你的动作 · CAMERA NEEDED"}</p>
            {cameraStatus !== "loading" && (
              <>
                <button type="button" onClick={onRetryCamera}>再次启用摄像头 · RETRY CAMERA</button>
                <button className="fallback-link" type="button" onClick={onFallbackStart}>ENTER · OPERATOR FALLBACK</button>
              </>
            )}
          </div>
        )}
      </motion.div>
      <div className="corner-mark" aria-hidden="true">玄<br />奘</div>
    </motion.section>
  );
}
