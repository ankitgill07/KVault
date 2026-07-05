// src/components/VideoPlayer.tsx
//
// Video Player Component - Handles video playback with progress tracking
// Supports real-time progress updates and lesson completion

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  CheckCircle2,
} from "lucide-react";
import type { Lesson } from "../lib/courseTypes";
import { enrollmentService } from "../services/enrollmentService";

interface VideoPlayerProps {
  lesson: Lesson;
  courseId: string;
  onComplete: (lessonId: string) => void;
  onProgress: (currentTime: number, duration: number) => void;
  isCompleted?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  lesson,
  onComplete,
  onProgress,
  isCompleted = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [skipFeedback, setSkipFeedback] = useState<{
    show: boolean;
    direction: "back" | "forward";
    position: number;
  }>({ show: false, direction: "back", position: 0 });

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentTime]);

  // Mark lesson as completed when video ends
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (!isCompleted) {
      onComplete(lesson._id);
    }
  }, [lesson._id, onComplete, isCompleted]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Throttle progress updates to every 5 seconds
    const now = Date.now();
    if (now - lastUpdateTimeRef.current > 5000) {
      lastUpdateTimeRef.current = now;
      onProgress(
        current,
        videoRef.current.duration || lesson.videoDuration || 0,
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration =
        videoRef.current.duration || lesson.videoDuration || 0;
      setDuration(videoDuration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number, direction: "back" | "forward") => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    setSkipFeedback({
      show: true,
      direction,
      position:
        direction === "back"
          ? 20
          : containerRef.current
            ? containerRef.current.offsetWidth - 20
            : 80,
    });
    setTimeout(
      () => setSkipFeedback((prev) => ({ ...prev, show: false })),
      600,
    );
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          handleTogglePlay();
          break;
        case "ArrowLeft":
          handleSkip(-10, "back");
          break;
        case "ArrowRight":
          handleSkip(10, "forward");
          break;
        case "ArrowUp":
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "f":
          handleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
      }
    },
    [
      volume,
      handleTogglePlay,
      handleSkip,
      handleVolumeChange,
      toggleMute,
      handleFullscreen,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden shadow-lg group"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video object-contain"
        poster={lesson.thumbnail}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onClick={handleTogglePlay}
        playsInline
      >
        {lesson.videoUrl && <source src={lesson.videoUrl} type="video/mp4" />}
      </video>

      {/* Skip Feedback */}
      {skipFeedback.show && (
        <div
          className="absolute top-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity duration-300"
          style={{ left: skipFeedback.position }}
        >
          {skipFeedback.direction === "back" ? (
            <>
              <SkipBack className="w-4 h-4" />
              <span>10s</span>
            </>
          ) : (
            <>
              <SkipForward className="w-4 h-4" />
              <span>10s</span>
            </>
          )}
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-[#10B981] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      )}

      {/* Center Play Button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={handleTogglePlay}
            className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
          >
            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Video Controls */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent
          transition-opacity duration-300 p-4
          ${showControls ? "opacity-100" : "opacity-0"}
        `}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="progress-bar group mb-3 cursor-pointer"
          onClick={handleSeek}
        >
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden group-hover:h-2.5 transition-all">
            <div
              className="h-full bg-[#6C4DFF] rounded-full relative transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSkip(-10, "back")}
              type="button"
              className="text-white hover:text-[#6C4DFF] transition-colors p-1"
              title="Skip back 10s"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              type="button"
              className="text-white p-2 hover:scale-110 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white" />
              )}
            </button>

            <button
              onClick={() => handleSkip(10, "forward")}
              type="button"
              className="text-white hover:text-[#6C4DFF] transition-colors p-1"
              title="Skip forward 10s"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} /{" "}
              {formatTime(duration || lesson.videoDuration || 0)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                className="text-white hover:text-[#6C4DFF] transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  className="w-16 accent-[#6C4DFF]"
                />
              </div>
            </div>

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:text-[#6C4DFF] transition-colors flex items-center gap-1 px-2 py-1"
              >
                <span className="text-xs font-medium">{playbackSpeed}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-700 ${
                        playbackSpeed === speed
                          ? "text-[#6C4DFF]"
                          : "text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="text-white hover:text-[#6C4DFF] transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-[#6C4DFF] transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
