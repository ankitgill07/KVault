import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createPlayer,
  selectPlayback,
  selectTime,
  selectError,
} from "@videojs/react";
import { VideoSkin, Video, videoFeatures } from "@videojs/react/video";
import "@videojs/react/video/skin.css";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { Lesson } from "../api/lessonApi";
import { getMediaUrl } from "../utils/mediaUrl";
import { axiosInstance } from "../api/axoisInstance";

interface VideoPlayerProps {
  lesson: Lesson;
  courseId: string;
  onComplete: (lessonId: string) => Promise<void>;
  onProgress: (currentTime: number, duration: number) => Promise<void>;
  isCompleted: boolean;
  initialTime?: number;
  posterUrl?: string;
}

// The player "shape" (which features it supports) is fixed for the app,
// so this is created once at module scope rather than per render/instance.
const Player = createPlayer({ features: videoFeatures });

// Renders nothing — lives inside <Player.Provider> purely to bridge player
// state (progress, completion, resume, errors) out to the lesson APIs.
// This mirrors the old component's videojs `.on(...)` listeners, but as
// reactive `usePlayer` selector subscriptions instead of imperative events.
const PlaybackTracker: React.FC<{
  lessonId: string;
  initialTime: number;
  onComplete: (lessonId: string) => Promise<void>;
  onProgress: (currentTime: number, duration: number) => Promise<void>;
  onErrorMessage: (message: string) => void;
}> = ({ lessonId, initialTime, onComplete, onProgress, onErrorMessage }) => {
  const time = Player.usePlayer(selectTime);
  const playback = Player.usePlayer(selectPlayback);
  const err = Player.usePlayer(selectError);

  const lastProgressSent = useRef(0);
  const seekedRef = useRef(false);
  const completedRef = useRef(false);

  // Resume from the last saved position once duration is known
  useEffect(() => {
    if (!seekedRef.current && initialTime > 0 && time && time.duration > 0) {
      seekedRef.current = true;
      time.seek(initialTime);
    }
  }, [time?.duration, initialTime]);

  // Report progress in ~5s increments
  useEffect(() => {
    if (!time) return;
    if (Math.abs(time.currentTime - lastProgressSent.current) >= 5) {
      lastProgressSent.current = time.currentTime;
      onProgress(time.currentTime, time.duration).catch((e) => {
        console.error("Error updating progress:", e);
      });
    }
  }, [time?.currentTime, time?.duration, onProgress]);

  // Fire completion once, when playback ends
  useEffect(() => {
    if (playback?.ended && !completedRef.current) {
      completedRef.current = true;
      onComplete(lessonId).catch((e) => {
        console.error("Error marking lesson completed:", e);
      });
    }
    if (playback && !playback.ended) {
      completedRef.current = false;
    }
  }, [playback?.ended, lessonId, onComplete]);

  // Surface media errors to the parent
  useEffect(() => {
    onErrorMessage(err?.error?.message ?? "");
  }, [err?.error, onErrorMessage]);

  return null;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  courseId,
  onComplete,
  onProgress,
  isCompleted,
  initialTime = 0,
  posterUrl,
}) => {
  const [playerError, setPlayerError] = useState<string>("");
  const [streamSrc, setStreamSrc] = useState<string>("");
  const [isAcquiringSession, setIsAcquiringSession] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamSessionIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const isPreviewOrFree = lesson.isPreview || lesson.isFree;
  const poster = getMediaUrl(posterUrl);

  // Build the base stream URL for this lesson
  const rawStreamUrl = getMediaUrl(lesson.videoUrl);
  const baseStreamUrl = rawStreamUrl.startsWith("/")
    ? `http://localhost:3000${rawStreamUrl}`
    : rawStreamUrl;

  // ── Heartbeat sender ─────────────────────────────────────────────────
  const startHeartbeat = useCallback(
    (ssid: string) => {
      // Clear any existing heartbeat
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }

      heartbeatRef.current = setInterval(async () => {
        try {
          await axiosInstance.post(`/lessons/${lesson._id}/heartbeat`, {
            streamSessionId: ssid,
          });
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 410) {
            // Stream was evicted or expired
            setPlayerError(
              "Stream closed. You may be watching on another device.",
            );
            if (heartbeatRef.current) {
              clearInterval(heartbeatRef.current);
              heartbeatRef.current = null;
            }
          }
        }
      }, 30_000);
    },
    [lesson._id],
  );

  // ── Stream session acquisition ───────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (isPreviewOrFree && !token) {
      // Preview / free lessons stream directly for guests — no session needed
      setStreamSrc(baseStreamUrl);
      return;
    }

    // Paid lesson — acquire a stream session first
    let cancelled = false;
    setIsAcquiringSession(true);
    setPlayerError("");

    (async () => {
      try {
        const response = await axiosInstance.post(
          `/lessons/${lesson._id}/stream-session`,
        );
        if (cancelled || !mountedRef.current) return;

        const ssid = response.data?.data?.streamSessionId;
        if (!ssid) {
          setPlayerError("Failed to initialize video stream.");
          return;
        }

        streamSessionIdRef.current = ssid;

        // Build the stream URL with the session ID
        const separator = baseStreamUrl.includes("?") ? "&" : "?";
        setStreamSrc(`${baseStreamUrl}${separator}ssid=${ssid}`);

        // Start heartbeats
        startHeartbeat(ssid);
      } catch (err: any) {
        if (cancelled || !mountedRef.current) return;

        const status = err?.response?.status;
        if (status === 429) {
          setPlayerError(
            "Simultaneous stream limit exceeded. You are watching on too many devices.",
          );
        } else if (status === 403) {
          setPlayerError(
            "Access denied. Please purchase the course to watch this lesson.",
          );
        } else if (status === 401) {
          setPlayerError("Please log in to watch this lesson.");
        } else {
          setPlayerError("Failed to initialize video stream.");
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setIsAcquiringSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;

      // Stop heartbeat
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [lesson._id, isPreviewOrFree, baseStreamUrl, startHeartbeat]);

  // Reset local error state whenever the lesson/source changes
  useEffect(() => {
    setPlayerError("");
  }, [lesson._id, courseId]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-black group">
      {streamSrc && !playerError ? (
        // `key` forces a full remount (fresh player store + media element)
        // whenever the lesson changes, equivalent to the old dispose()/re-create.
        <Player.Provider key={`${lesson._id}-${streamSrc}`}>
          <VideoSkin className="h-full w-full">
            <Video
              src={streamSrc}
              poster={poster}
              autoPlay
              playsInline
            />
          </VideoSkin>
          <PlaybackTracker
            lessonId={lesson._id}
            initialTime={initialTime}
            onComplete={onComplete}
            onProgress={onProgress}
            onErrorMessage={setPlayerError}
          />
        </Player.Provider>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6 text-center">
          <div className="max-w-md space-y-3 text-white">
            {isAcquiringSession ? (
              <>
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <p className="text-sm font-semibold">Preparing video…</p>
              </>
            ) : playerError ? (
              <>
                <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
                <p className="text-sm font-semibold">Video cannot play</p>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {playerError}
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
                <p className="text-sm font-semibold">Video cannot play</p>
                <p className="text-xs leading-relaxed text-zinc-300">
                  This lesson does not have a playable video URL yet.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {playerError && streamSrc && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-6 text-center">
          <div className="max-w-md space-y-3 text-white">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
            <p className="text-sm font-semibold">Video cannot play</p>
            <p className="text-xs leading-relaxed text-zinc-300">{playerError}</p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg z-10 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-semibold">Completed</span>
        </div>
      )}
    </div>
  );
};
