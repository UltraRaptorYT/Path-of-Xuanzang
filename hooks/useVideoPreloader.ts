"use client";

import { useEffect, useState } from "react";
import { station1Rounds } from "@/data/station1";

const VIDEO_CACHE_NAME = "path-of-xuanzang-video-assets-v2";
const VIDEO_SOURCES = Array.from(new Set([
  "/videos/background.mp4",
  ...station1Rounds.map((round) => round.video),
  "/videos/optimized/Ending%20Map-1080p.mp4",
]));

type VideoPreloadListener = (completed: number) => void;

let preloadPromise: Promise<void> | null = null;
let completedVideos = 0;
const preloadListeners = new Set<VideoPreloadListener>();

function publishProgress(completed: number) {
  completedVideos = completed;
  for (const listener of preloadListeners) listener(completed);
}

async function waitForServiceWorkerControl() {
  if (!("serviceWorker" in navigator) || !("caches" in window)) {
    throw new Error("Video caching requires a browser with service worker support.");
  }

  await navigator.serviceWorker.register("/video-cache-sw.js", { updateViaCache: "none" });
  await navigator.serviceWorker.ready;
  if (navigator.serviceWorker.controller) return;

  await new Promise<void>((resolve, reject) => {
    let timeout: number;
    const handleControllerChange = () => {
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      resolve();
    };
    timeout = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      reject(new Error("The video cache is taking too long to start. Retry to continue."));
    }, 15_000);
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange, { once: true });
    if (navigator.serviceWorker.controller) handleControllerChange();
  });
}

async function cacheAllVideos() {
  publishProgress(0);
  await waitForServiceWorkerControl();
  const cache = await caches.open(VIDEO_CACHE_NAME);

  for (const [index, source] of VIDEO_SOURCES.entries()) {
    const cached = await cache.match(source);
    if (!cached) {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not preload ${source} (${response.status}).`);
      }
      await cache.put(source, response.clone());
    }

    publishProgress(index + 1);
  }
}

function startCachingVideos() {
  if (!preloadPromise) {
    preloadPromise = cacheAllVideos().catch((error: unknown) => {
      preloadPromise = null;
      throw error;
    });
  }
  return preloadPromise;
}

export function useVideoPreloader() {
  const [attempt, setAttempt] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const onProgress: VideoPreloadListener = (value) => {
      if (active) setCompleted(value);
    };

    setError(null);
    setReady(false);
    preloadListeners.add(onProgress);
    onProgress(completedVideos);

    void startCachingVideos()
      .then(() => {
        if (active) setReady(true);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not preload the videos.");
        }
      });

    return () => {
      active = false;
      preloadListeners.delete(onProgress);
    };
  }, [attempt]);

  return {
    completed,
    total: VIDEO_SOURCES.length,
    ready,
    error,
    retry: () => {
      setCompleted(0);
      setAttempt((value) => value + 1);
    },
  };
}
