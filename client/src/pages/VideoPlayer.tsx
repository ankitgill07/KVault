import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Captions,
  Rewind,
  FastForward,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

type Props = {
  src: string;
  poster?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const QUALITIES = ["Auto", "1080p", "720p"];

function fmt(t: number) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ src, poster, onPrev, onNext, hasPrev, hasNext }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [captions, setCaptions] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState<"root" | "speed" | "quality" | null>(null);
  const [hoverTime, setHoverTime] = useState<{ t: number; x: number } | null>(null);
  const [skipOverlay, setSkipOverlay] = useState<null | "back" | "fwd">(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
    setSkipOverlay(delta < 0 ? "back" : "fwd");
    window.setTimeout(() => setSkipOverlay(null), 500);
  }, []);

  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current; if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    v.playbackRate = speed;
  }, [speed]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case " ": e.preventDefault(); togglePlay(); break;
        case "ArrowLeft": seekBy(-10); break;
        case "ArrowRight": seekBy(10); break;
        case "f": case "F": toggleFullscreen(); break;
        case "m": case "M": toggleMute(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy]);

  const scheduleHide = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing && !settingsOpen) setShowControls(false);
    }, 2500);
  };

  const handleMove = () => {
    setShowControls(true);
    scheduleHide();
  };

  useEffect(() => {
    if (!playing) setShowControls(true);
    else scheduleHide();
     
  }, [playing, settingsOpen]);

  const onLoaded = () => setDuration(videoRef.current?.duration || 0);
  const onTime = () => {
    const v = videoRef.current; if (!v) return;
    setCurrent(v.currentTime);
    try {
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
    } catch { /* noop */ }
  };

  const seekFromEvent = (clientX: number) => {
    const bar = progressRef.current; const v = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
  };

  const onProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current; if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime({ t: ratio * duration, x: e.clientX - rect.left });
  };

  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => seekFromEvent(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [dragging]);

  // Double-click zones for skip
  const lastTap = useRef<{ side: "l" | "r"; at: number } | null>(null);
  const handleZoneClick = (side: "l" | "r") => {
    const now = Date.now();
    if (lastTap.current && lastTap.current.side === side && now - lastTap.current.at < 300) {
      seekBy(side === "l" ? -10 : 10);
      lastTap.current = null;
    } else {
      lastTap.current = { side, at: now };
      window.setTimeout(() => {
        if (lastTap.current && lastTap.current.at === now) {
          togglePlay();
          lastTap.current = null;
        }
      }, 280);
    }
  };

  const pct = duration ? (current / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group relative w-full overflow-hidden rounded-2xl bg-black aspect-video shadow-elevated"
      onMouseMove={handleMove}
      onMouseLeave={() => { if (playing && !settingsOpen) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-contain bg-black"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={onLoaded}
        onTimeUpdate={onTime}
        onClick={(e) => e.preventDefault()}
        playsInline
      />

      {/* Double-click zones */}
      <button
        aria-label="Skip back zone"
        className="absolute inset-y-0 left-0 w-1/3"
        onClick={() => handleZoneClick("l")}
      />
      <button
        aria-label="Skip forward zone"
        className="absolute inset-y-0 right-0 w-1/3"
        onClick={() => handleZoneClick("r")}
      />

      {/* Skip overlay */}
      {skipOverlay && (
        <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${skipOverlay === "back" ? "left-[12%]" : "right-[12%]"} flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-md animate-scale-in`}>
          {skipOverlay === "back" ? <Rewind className="h-8 w-8 text-white" strokeWidth={1.5} /> : <FastForward className="h-8 w-8 text-white" strokeWidth={1.5} />}
        </div>
      )}

      {/* Center play button (when paused) */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center"
          aria-label="Play"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-primary shadow-elevated transition-transform hover:scale-105">
            <Play className="h-8 w-8 fill-current" strokeWidth={0} />
          </span>
        </button>
      )}

      {/* Prev / Next lesson floating buttons */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className={`absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/65 md:opacity-0 md:group-hover:opacity-100 ${showControls ? "opacity-100" : ""}`}
          aria-label="Previous lesson"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className={`absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/65 md:opacity-0 md:group-hover:opacity-100 ${showControls ? "opacity-100" : ""}`}
          aria-label="Next lesson"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
        </button>
      )}

      {/* Bottom controls */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="group/bar relative h-4 cursor-pointer"
          onMouseMove={onProgressHover}
          onMouseLeave={() => setHoverTime(null)}
          onMouseDown={(e) => { setDragging(true); seekFromEvent(e.clientX); }}
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition-all group-hover/bar:h-1.5">
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${bufPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pct}%` }} />
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-md opacity-0 transition-opacity group-hover/bar:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>
          {hoverTime && (
            <div
              className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md bg-black/85 px-2 py-1 text-xs font-medium text-white"
              style={{ left: hoverTime.x }}
            >
              {fmt(hoverTime.t)}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-white">
          {/* Left cluster */}
          <IconBtn label={playing ? "Pause" : "Play"} onClick={togglePlay}>
            {playing ? <Pause className="h-5 w-5 fill-current" strokeWidth={0} /> : <Play className="h-5 w-5 fill-current" strokeWidth={0} />}
          </IconBtn>
          <IconBtn label="Back 10s" onClick={() => seekBy(-10)}>
            <Rewind className="h-5 w-5" strokeWidth={1.75} />
          </IconBtn>
          <IconBtn label="Forward 10s" onClick={() => seekBy(10)}>
            <FastForward className="h-5 w-5" strokeWidth={1.75} />
          </IconBtn>
          <div className="ml-1 text-xs tabular-nums text-white/90">
            {fmt(current)} <span className="text-white/50">/ {fmt(duration)}</span>
          </div>

          <div className="flex-1" />

          {/* Right cluster */}
          <div className="group/vol flex items-center gap-1">
            <IconBtn label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" strokeWidth={1.75} /> : <Volume2 className="h-5 w-5" strokeWidth={1.75} />}
            </IconBtn>
            <input
              type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val); setMuted(val === 0);
                if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0; }
              }}
              className="slider-thumb h-1 w-0 rounded-full bg-white/30 transition-all duration-200 group-hover/vol:w-20 accent-white"
              style={{ backgroundImage: `linear-gradient(to right, white ${(muted?0:volume)*100}%, rgba(255,255,255,0.3) ${(muted?0:volume)*100}%)` }}
            />
          </div>

          <button
            onClick={() => { setSettingsOpen(settingsOpen ? null : "root"); }}
            className="rounded-md px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
            aria-label="Playback speed"
          >
            {speed}×
          </button>

          <IconBtn label="Captions" onClick={() => setCaptions((c) => !c)}>
            <Captions className={`h-5 w-5 ${captions ? "text-primary" : ""}`} strokeWidth={1.75} />
          </IconBtn>

          <div className="relative">
            <IconBtn label="Settings" onClick={() => setSettingsOpen(settingsOpen ? null : "root")}>
              <Settings className="h-5 w-5" strokeWidth={1.75} />
            </IconBtn>
            {settingsOpen && (
              <div className="absolute bottom-11 right-0 w-56 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/95 text-sm text-white shadow-elevated backdrop-blur-md animate-scale-in">
                {settingsOpen === "root" && (
                  <div className="py-1">
                    <MenuRow label="Playback speed" value={`${speed}×`} onClick={() => setSettingsOpen("speed")} />
                    <MenuRow label="Captions" value={captions ? "On" : "Off"} onClick={() => setCaptions((c) => !c)} />
                    <MenuRow label="Quality" value={quality} onClick={() => setSettingsOpen("quality")} />
                  </div>
                )}
                {settingsOpen === "speed" && (
                  <div className="py-1">
                    <MenuHeader onBack={() => setSettingsOpen("root")}>Playback speed</MenuHeader>
                    {SPEEDS.map((s) => (
                      <MenuOption key={s} selected={s === speed} onClick={() => { setSpeed(s); setSettingsOpen("root"); }}>
                        {s === 1 ? "Normal" : `${s}×`}
                      </MenuOption>
                    ))}
                  </div>
                )}
                {settingsOpen === "quality" && (
                  <div className="py-1">
                    <MenuHeader onBack={() => setSettingsOpen("root")}>Quality</MenuHeader>
                    {QUALITIES.map((q) => (
                      <MenuOption key={q} selected={q === quality} onClick={() => { setQuality(q); setSettingsOpen("root"); }}>
                        {q}
                      </MenuOption>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <IconBtn label="Fullscreen" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize className="h-5 w-5" strokeWidth={1.75} /> : <Maximize className="h-5 w-5" strokeWidth={1.75} />}
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick?: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/95 transition-colors hover:bg-white/12"
    >
      {children}
    </button>
  );
}

function MenuRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-white/10">
      <span>{label}</span>
      <span className="flex items-center gap-1 text-white/60">{value} <ChevronRight className="h-4 w-4" /></span>
    </button>
  );
}
function MenuHeader({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <button onClick={onBack} className="flex w-full items-center gap-2 border-b border-white/10 px-3 py-2 text-left text-white/70 hover:bg-white/5">
      <ChevronLeft className="h-4 w-4" /> {children}
    </button>
  );
}
function MenuOption({ children, selected, onClick }: { children: React.ReactNode; selected?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-white/10">
      <span>{children}</span>
      {selected && <Check className="h-4 w-4 text-primary" />}
    </button>
  );
}
