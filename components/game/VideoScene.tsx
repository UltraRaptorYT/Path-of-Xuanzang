"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface VideoSceneProps {
  src: string;
  videoKey: number;
  onEnded: () => void;
  onStatus: (status: string) => void;
}

export function VideoScene({ src, videoKey, onEnded, onStatus }: VideoSceneProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    onStatus("loading");
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => onStatus("autoplay-blocked"));
    });
  }, [src, videoKey, onStatus]);

  return (
    <motion.section
      className="scene video-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <video
        key={`${src}-${videoKey}`}
        ref={ref}
        src={src}
        autoPlay
        playsInline
        preload="auto"
        className="cinematic-video"
        onCanPlay={() => onStatus("playing")}
        onPlay={() => onStatus("playing")}
        onPause={() => onStatus("paused")}
        onEnded={onEnded}
        onError={() => onStatus("error")}
      />
      <div className="video-vignette" />
      <p className="video-skip">播放结束后自动继续 · AUTO CONTINUE</p>
    </motion.section>
  );
}
