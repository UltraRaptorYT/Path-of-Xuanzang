"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { finalVideo, station1Rounds } from "@/data/station1";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { usePoseController } from "@/hooks/usePoseController";
import { useGameStore } from "@/store/gameStore";
import { AnswerReveal } from "./AnswerReveal";
import { JourneyMap } from "./JourneyMap";
import { LockedScene } from "./LockedScene";
import { OperatorOverlay } from "./OperatorOverlay";
import { PosePresence } from "./PosePresence";
import { QuestionScene } from "./QuestionScene";
import { ResetOverlay } from "./ResetOverlay";
import { StartScene } from "./StartScene";
import { VideoScene } from "./VideoScene";

export function GameController() {
  useKeyboardControls();
  const {
    currentScene,
    currentRound,
    selectedSide,
    journeyProgress,
    countdown,
    operatorOpen,
    resetOpen,
    videoKey,
    setScene,
    selectSide,
    setCountdown,
    lockChoice,
    advanceRound,
    setResetOpen,
    reset,
  } = useGameStore();
  const pose = usePoseController(currentScene);
  const [videoStatus, setVideoStatus] = useState("idle");
  const round = station1Rounds[currentRound];

  const start = useCallback(() => {
    setScene("video");
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, [setScene]);

  useEffect(() => {
    if (currentScene === "start" && pose.startProgress >= 1) start();
  }, [currentScene, pose.startProgress, start]);

  useEffect(() => {
    if (currentScene === "question" || currentScene === "countdown") {
      selectSide(pose.dominantSide);
    }
  }, [currentScene, pose.dominantSide, selectSide]);

  useEffect(() => {
    if (currentScene !== "question") return;
    const timer = window.setTimeout(() => setScene("countdown"), 1200);
    return () => window.clearTimeout(timer);
  }, [currentScene, setScene]);

  useEffect(() => {
    if (currentScene !== "countdown") return;
    if (countdown <= 0) {
      if (selectedSide) lockChoice();
      return;
    }
    const timer = window.setTimeout(
      () => setCountdown(countdown - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [currentScene, countdown, selectedSide, lockChoice, setCountdown]);

  useEffect(() => {
    if (currentScene !== "locked" || !round) return;
    const timer = window.setTimeout(
      () => round.type === "quiz" ? setScene("reveal") : advanceRound(),
      round.type === "quiz" ? 1800 : 2600,
    );
    return () => window.clearTimeout(timer);
  }, [advanceRound, currentScene, setScene, round]);

  useEffect(() => {
    if (currentScene !== "reveal") return;
    const timer = window.setTimeout(() => setScene("finalVideo"), 4300);
    return () => window.clearTimeout(timer);
  }, [currentScene, setScene]);

  const videoEnded = useCallback(() => {
    useGameStore.getState().setScene("question");
  }, []);

  const finalVideoEnded = useCallback(() => {
    useGameStore.getState().setScene("journey");
  }, []);

  return (
    <main className="game-shell">
      <AnimatePresence mode="wait">
        {currentScene === "start" && (
          <StartScene
            key="start"
            cameraStatus={pose.status}
            poseProgress={pose.startProgress}
            onRetryCamera={pose.restartCamera}
            onFallbackStart={start}
          />
        )}

        {currentScene === "video" && round && (
          <VideoScene
            key={`video-${currentRound}-${videoKey}`}
            src={round.video}
            videoKey={videoKey}
            onEnded={videoEnded}
            onStatus={setVideoStatus}
          />
        )}

        {(currentScene === "question" || currentScene === "countdown") && round && (
          <QuestionScene
            key={`question-${currentRound}`}
            round={round}
            roundNumber={currentRound + 1}
            selected={selectedSide}
            countdown={countdown}
            isCounting={currentScene === "countdown"}
            leftCount={pose.leftCount}
            rightCount={pose.rightCount}
            sideProgress={pose.sideProgress}
          />
        )}

        {currentScene === "locked" && round && selectedSide && (
          <LockedScene key={`locked-${currentRound}`} round={round} selected={selectedSide} />
        )}

        {currentScene === "reveal" && round && (
          <AnswerReveal key="reveal" round={round} selected={selectedSide} />
        )}

        {currentScene === "finalVideo" && (
          <VideoScene
            key={`final-${videoKey}`}
            src={finalVideo}
            videoKey={videoKey}
            onEnded={finalVideoEnded}
            onStatus={setVideoStatus}
          />
        )}

        {currentScene === "journey" && (
          <JourneyMap key="journey" progress={journeyProgress} onRestart={reset} />
        )}
      </AnimatePresence>

      <PosePresence
        videoRef={pose.videoRef}
        status={pose.status}
        players={pose.players}
        visible={currentScene === "question" || currentScene === "countdown"}
        showPreview={operatorOpen}
      />

      <div className="video-preloader" aria-hidden="true">
        {station1Rounds.slice(1).map((item) => <video key={item.id} src={item.video} preload="auto" />)}
        <video src={finalVideo} preload="auto" />
      </div>

      <OperatorOverlay videoStatus={videoStatus} cameraStatus={pose.status} />
      <AnimatePresence>
        {resetOpen && <ResetOverlay onReset={reset} onCancel={() => setResetOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}
