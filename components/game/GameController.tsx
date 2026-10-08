"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { station1Rounds } from "@/data/station1";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { usePoseController } from "@/hooks/usePoseController";
import { useGameStore } from "@/store/gameStore";
import { AnswerReveal } from "./AnswerReveal";
import { JourneyMap } from "./JourneyMap";
import { OperatorOverlay } from "./OperatorOverlay";
import { PosePresence } from "./PosePresence";
import { QuestionScene } from "./QuestionScene";
import { ResetOverlay } from "./ResetOverlay";
import { StartScene } from "./StartScene";
import { VideoScene } from "./VideoScene";

const JOURNEY_DISPLAY_MS = 15_000;
const LOCKED_SELECTION_HOLD_MS = 1_000;
const RESULT_HOLD_AFTER_SOUND_MS = 2_000;

export function GameController() {
  useKeyboardControls();
  const {
    currentScene,
    currentRound,
    selectedSide,
    countdown,
    operatorOpen,
    resetOpen,
    videoKey,
    voteCounts,
    voteSummaries,
    refreshVoteSummary,
    setVoteCounts,
    setScene,
    selectSide,
    setCountdown,
    lockChoice,
    advanceRound,
    setResetOpen,
    reset,
  } = useGameStore();
  const pose = usePoseController(currentScene);
  const backgroundAudioRef = useRef<HTMLAudioElement>(null);
  const voteRefreshForRoundRef = useRef<string | null>(null);
  const [videoStatus, setVideoStatus] = useState("idle");
  const [journeySecondsRemaining, setJourneySecondsRemaining] = useState(JOURNEY_DISPLAY_MS / 1000);
  const round = station1Rounds[currentRound];

  useEffect(() => {
    if (currentScene !== "question" || !round) {
      voteRefreshForRoundRef.current = null;
      return;
    }
    if (voteRefreshForRoundRef.current === round.id) return;

    voteRefreshForRoundRef.current = round.id;
    void refreshVoteSummary(round.id);
  }, [currentScene, round, refreshVoteSummary]);

  const startBackgroundAudio = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.volume = currentScene === "video" ? 0.08 : 0.22;
    if (audio.paused) void audio.play().catch(() => undefined);
  }, [currentScene]);

  useEffect(() => {
    startBackgroundAudio();
  }, [startBackgroundAudio]);

  const start = useCallback(() => {
    startBackgroundAudio();
    setScene("video");
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, [setScene, startBackgroundAudio]);

  useEffect(() => {
    if (currentScene === "start" && pose.startProgress >= 1) start();
  }, [currentScene, pose.startProgress, start]);

  useEffect(() => {
    if (currentScene === "question" || currentScene === "countdown") {
      selectSide(pose.dominantSide);
    }
  }, [currentScene, pose.dominantSide, selectSide]);

  useEffect(() => {
    if (currentScene !== "question" && currentScene !== "countdown") return;
    setVoteCounts(pose.leftCount, pose.rightCount);
  }, [currentScene, pose.leftCount, pose.rightCount, setVoteCounts]);

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
    if (currentScene !== "locked" || !round || !selectedSide) return;

    const isCorrect = round.correctSide == null || selectedSide === round.correctSide;
    const sound = new Audio(isCorrect ? "/audio/correct.mp3" : "/audio/wrong.mp3");
    sound.volume = 0.28;
    let finished = false;
    let playFailureFallback: number | undefined;
    let revealTimer: number | undefined;
    const reveal = () => {
      if (finished) return;
      finished = true;
      revealTimer = window.setTimeout(() => setScene("reveal"), RESULT_HOLD_AFTER_SOUND_MS);
    };
    const fallback = window.setTimeout(reveal, 9000);
    const soundStartTimer = window.setTimeout(() => void sound.play().catch(() => {
      playFailureFallback = window.setTimeout(reveal, 700);
    }), LOCKED_SELECTION_HOLD_MS);
    sound.addEventListener("ended", reveal, { once: true });
    sound.addEventListener("error", reveal, { once: true });

    return () => {
      window.clearTimeout(fallback);
      window.clearTimeout(soundStartTimer);
      if (playFailureFallback !== undefined) window.clearTimeout(playFailureFallback);
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
      sound.pause();
      sound.removeEventListener("ended", reveal);
      sound.removeEventListener("error", reveal);
      sound.src = "";
    };
  }, [currentScene, round, selectedSide, setScene]);

  useEffect(() => {
    if (currentScene !== "reveal") return;
    const timer = window.setTimeout(() => advanceRound(), 7000);
    return () => window.clearTimeout(timer);
  }, [advanceRound, currentScene]);

  useEffect(() => {
    if (currentScene !== "journey") return;
    let secondsRemaining = JOURNEY_DISPLAY_MS / 1000;
    setJourneySecondsRemaining(secondsRemaining);
    const timer = window.setInterval(() => {
      secondsRemaining -= 1;
      setJourneySecondsRemaining(secondsRemaining);
      if (secondsRemaining <= 0) {
        window.clearInterval(timer);
        reset();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentScene, reset]);

  const videoEnded = useCallback(() => {
    useGameStore.getState().setScene("question");
  }, []);

  return (
    <main className={`game-shell ${currentScene === "video" ? "is-playing-station-video" : ""}`} onPointerDownCapture={startBackgroundAudio} onKeyDownCapture={startBackgroundAudio}>
      <video className="game-background-video" autoPlay muted loop playsInline aria-hidden="true" tabIndex={-1}>
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>
      <div className="game-background-wash" aria-hidden="true" />
      <audio ref={backgroundAudioRef} src="/audio/background.mp3" autoPlay loop preload="auto" />

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

        {(currentScene === "question" || currentScene === "countdown" || currentScene === "locked") && round && (
          <QuestionScene
            key={`question-${currentRound}`}
            round={round}
            roundNumber={currentRound + 1}
            totalRounds={station1Rounds.length}
            selected={selectedSide}
            showGlobalResults={currentScene === "locked"}
            globalVotes={voteSummaries[round.id] ?? null}
            countdown={countdown}
            isCounting={currentScene === "countdown"}
            leftCount={currentScene === "locked" ? voteCounts.left : pose.leftCount}
            rightCount={currentScene === "locked" ? voteCounts.right : pose.rightCount}
            sideProgress={pose.sideProgress}
          />
        )}

        {currentScene === "reveal" && round && (
          <AnswerReveal
            key={`reveal-${currentRound}`}
            round={round}
            selected={selectedSide}
            summary={voteSummaries[round.id] ?? null}
          />
        )}

        {currentScene === "journey" && (
          <JourneyMap
            key="journey"
            secondsRemaining={journeySecondsRemaining}
            onRestart={reset}
          />
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
        {station1Rounds.slice(1).map((item) => <video key={item.id} src={item.video} preload="metadata" />)}
      </div>

      <OperatorOverlay videoStatus={videoStatus} cameraStatus={pose.status} />
      <AnimatePresence>
        {resetOpen && <ResetOverlay onReset={reset} onCancel={() => setResetOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}
