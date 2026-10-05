"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  ObjectDetector,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import type { Side } from "@/data/station1";
import type { GameScene } from "@/store/gameStore";

export type CameraStatus =
  | "loading"
  | "ready"
  | "denied"
  | "unsupported"
  | "error";

export interface DetectedPlayer {
  id: number;
  centerX: number;
  box: { x: number; y: number; width: number; height: number };
}

export interface PoseControllerResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  players: DetectedPlayer[];
  leftCount: number;
  rightCount: number;
  dominantSide: Side | null;
  startProgress: number;
  sideProgress: number;
  restartCamera: () => void;
}

const START_HOLD_MS = 1200;
const SIDE_HOLD_MS = 1600;
const FRAME_INTERVAL_MS = 90;
const PERSON_SCORE_THRESHOLD = .35;

function handsRaised(points: NormalizedLandmark[]) {
  const nose = points[0];
  const leftWrist = points[15];
  const rightWrist = points[16];
  if (!nose || !leftWrist || !rightWrist) return false;
  const visible = [nose, leftWrist, rightWrist].every(
    (point) => (point.visibility ?? 1) > 0.45,
  );
  return visible && leftWrist.y < nose.y && rightWrist.y < nose.y;
}

function getCenterX(points: NormalizedLandmark[]) {
  const leftHip = points[23];
  const rightHip = points[24];
  const leftShoulder = points[11];
  const rightShoulder = points[12];
  const candidates = [leftHip, rightHip, leftShoulder, rightShoulder].filter(
    (point) => point && (point.visibility ?? 1) > 0.35,
  );
  if (!candidates.length) return .5;
  const rawCenter =
    candidates.reduce((total, point) => total + point.x, 0) / candidates.length;
  return 1 - rawCenter;
}

export function usePoseController(scene: GameScene): PoseControllerResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRef = useRef(scene);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const objectDetectorRef = useRef<ObjectDetector | null>(null);
  const taskModeRef = useRef<"pose" | "object" | null>(null);
  const taskLoadingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const startSinceRef = useRef<number | null>(null);
  const sideSinceRef = useRef<number | null>(null);
  const lastSideRef = useRef<Side | null>(null);
  const runIdRef = useRef(0);

  const [status, setStatus] = useState<CameraStatus>("loading");
  const [players, setPlayers] = useState<DetectedPlayer[]>([]);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [dominantSide, setDominantSide] = useState<Side | null>(null);
  const [startProgress, setStartProgress] = useState(0);
  const [sideProgress, setSideProgress] = useState(0);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    objectDetectorRef.current?.close();
    objectDetectorRef.current = null;
    taskModeRef.current = null;
    taskLoadingRef.current = false;
  }, []);

  const startCamera = useCallback(async () => {
    const runId = ++runIdRef.current;
    stop();
    setStatus("loading");
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    try {
      const [vision, stream] = await Promise.all([
        FilesetResolver.forVisionTasks("/mediapipe/wasm"),
        navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 960 },
            height: { ideal: 540 },
            facingMode: "user",
          },
          audio: false,
        }),
      ]);
      if (runId !== runIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const poseOptions = {
        baseOptions: {
          modelAssetPath: "/mediapipe/models/pose_landmarker_lite.task",
          delegate: "GPU" as const,
        },
        runningMode: "VIDEO" as const,
        numPoses: 6,
        minPoseDetectionConfidence: .45,
        minPosePresenceConfidence: .45,
        minTrackingConfidence: .45,
        outputSegmentationMasks: false,
      };
      let landmarker: PoseLandmarker;
      try {
        landmarker = await PoseLandmarker.createFromOptions(vision, poseOptions);
      } catch {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          ...poseOptions,
          baseOptions: { ...poseOptions.baseOptions, delegate: "CPU" },
        });
      }
      if (runId !== runIdRef.current) {
        landmarker.close();
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      landmarkerRef.current = landmarker;
      taskModeRef.current = "pose";
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera element is unavailable");
      video.srcObject = stream;
      await video.play();
      setStatus("ready");

      const detect = (time: number) => {
        if (runId !== runIdRef.current) return;
        frameRef.current = requestAnimationFrame(detect);
        const activeVideo = videoRef.current;
        if (!activeVideo || activeVideo.readyState < 2) return;
        const activeScene = sceneRef.current;
        if (activeScene !== "start" && activeScene !== "video" && activeScene !== "question" && activeScene !== "countdown") return;

        const targetMode = activeScene === "start" ? "pose" : "object";
        if (taskModeRef.current !== targetMode && !taskLoadingRef.current) {
          taskLoadingRef.current = true;
          landmarkerRef.current?.close();
          landmarkerRef.current = null;
          objectDetectorRef.current?.close();
          objectDetectorRef.current = null;
          void (async () => {
            try {
              if (targetMode === "object") {
                const options = {
                  baseOptions: {
                    modelAssetPath: "/mediapipe/models/efficientdet_lite0.tflite",
                    delegate: "GPU" as const,
                  },
                  runningMode: "VIDEO" as const,
                  categoryAllowlist: ["person"],
                  maxResults: 20,
                  scoreThreshold: PERSON_SCORE_THRESHOLD,
                };
                let detector: ObjectDetector;
                try {
                  detector = await ObjectDetector.createFromOptions(vision, options);
                } catch {
                  detector = await ObjectDetector.createFromOptions(vision, {
                    ...options,
                    baseOptions: { ...options.baseOptions, delegate: "CPU" },
                  });
                }
                if (runId !== runIdRef.current) detector.close();
                else {
                  objectDetectorRef.current = detector;
                  taskModeRef.current = "object";
                }
              } else {
                let nextLandmarker: PoseLandmarker;
                try {
                  nextLandmarker = await PoseLandmarker.createFromOptions(vision, poseOptions);
                } catch {
                  nextLandmarker = await PoseLandmarker.createFromOptions(vision, {
                    ...poseOptions,
                    baseOptions: { ...poseOptions.baseOptions, delegate: "CPU" },
                  });
                }
                if (runId !== runIdRef.current) nextLandmarker.close();
                else {
                  landmarkerRef.current = nextLandmarker;
                  taskModeRef.current = "pose";
                }
              }
            } catch (error) {
              console.error("Unable to switch camera detection mode", error);
              setStatus("error");
            } finally {
              taskLoadingRef.current = false;
            }
          })();
          return;
        }
        if (taskModeRef.current !== targetMode) return;
        if (activeScene === "video") return;
        if (time - lastFrameRef.current < FRAME_INTERVAL_MS) return;
        lastFrameRef.current = time;

        let nextPlayers: DetectedPlayer[] = [];
        if (activeScene === "start") {
          const activeLandmarker = landmarkerRef.current;
          if (!activeLandmarker) return;
          const result = activeLandmarker.detectForVideo(activeVideo, performance.now());
          nextPlayers = result.landmarks.map((landmarks, id) => ({
            id,
            centerX: getCenterX(landmarks),
            box: { x: 0, y: 0, width: 0, height: 0 },
          }));
          const raised = result.landmarks.some(handsRaised);
          if (raised) {
            startSinceRef.current ??= time;
            setStartProgress(Math.min(1, (time - startSinceRef.current) / START_HOLD_MS));
          } else {
            startSinceRef.current = null;
            setStartProgress(0);
          }
        } else {
          const activeDetector = objectDetectorRef.current;
          if (!activeDetector) return;
          const result = activeDetector.detectForVideo(activeVideo, performance.now());
          nextPlayers = result.detections.flatMap((detection, id) => {
            const box = detection.boundingBox;
            if (!box || !detection.categories.some((category) => category.categoryName === "person")) return [];
            const centerX = 1 - (box.originX + box.width / 2) / activeVideo.videoWidth;
            return [{
              id,
              centerX,
              box: {
                x: box.originX / activeVideo.videoWidth,
                y: box.originY / activeVideo.videoHeight,
                width: box.width / activeVideo.videoWidth,
                height: box.height / activeVideo.videoHeight,
              },
            }];
          });
          startSinceRef.current = null;
          setStartProgress(0);
        }
        setPlayers(nextPlayers);

        const nextLeft = nextPlayers.filter((player) => player.centerX < .47).length;
        const nextRight = nextPlayers.filter((player) => player.centerX > .53).length;
        const nextSide =
          nextLeft === nextRight ? null : nextLeft > nextRight ? "left" : "right";
        setLeftCount(nextLeft);
        setRightCount(nextRight);
        setDominantSide(nextSide);

        if ((activeScene === "question" || activeScene === "countdown") && nextSide) {
          if (lastSideRef.current !== nextSide) {
            lastSideRef.current = nextSide;
            sideSinceRef.current = time;
          }
          const started = sideSinceRef.current ?? time;
          setSideProgress(Math.min(1, (time - started) / SIDE_HOLD_MS));
        } else {
          lastSideRef.current = null;
          sideSinceRef.current = null;
          setSideProgress(0);
        }
      };

      frameRef.current = requestAnimationFrame(detect);
    } catch (error) {
      console.error("Unable to start pose controls", error);
      const denied = error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      setStatus(denied ? "denied" : "error");
      stop();
    }
  }, [stop]);

  useEffect(() => {
    sceneRef.current = scene;
    startSinceRef.current = null;
    sideSinceRef.current = null;
    lastSideRef.current = null;
    queueMicrotask(() => {
      setPlayers([]);
      setLeftCount(0);
      setRightCount(0);
      setDominantSide(null);
      setStartProgress(0);
      setSideProgress(0);
    });
  }, [scene]);

  useEffect(() => {
    queueMicrotask(() => void startCamera());
    return () => {
      runIdRef.current += 1;
      stop();
    };
  }, [startCamera, stop]);

  return {
    videoRef,
    status,
    players,
    leftCount,
    rightCount,
    dominantSide,
    startProgress,
    sideProgress,
    restartCamera: startCamera,
  };
}
