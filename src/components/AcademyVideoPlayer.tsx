import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface Chapter {
  title: string;
  time_seconds: number;
}

interface AcademyVideoPlayerProps {
  videoUrl: string;
  chapters?: Chapter[];
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onComplete?: () => void;
}

const AcademyVideoPlayer = ({
  videoUrl,
  chapters = [],
  initialTime = 0,
  onTimeUpdate,
  onComplete,
}: AcademyVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [completed, setCompleted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastSaveTime = useRef(0);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (initialTime > 0) video.currentTime = initialTime;
  }, [initialTime]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Save progress every 10s
    if (Math.abs(video.currentTime - lastSaveTime.current) >= 10) {
      lastSaveTime.current = video.currentTime;
      onTimeUpdate?.(video.currentTime);
    }

    // Mark complete at 90%
    if (!completed && duration > 0 && video.currentTime / duration >= 0.9) {
      setCompleted(true);
      onComplete?.();
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
    resetHideTimer();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!fullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * duration;
    setCurrentTime(video.currentTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black cursor-pointer group"
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        muted={muted}
        playsInline
      />

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer" onClick={seekTo}>
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              {/* Chapter markers */}
              {chapters.map((ch, i) => {
                const pos = duration > 0 ? (ch.time_seconds / duration) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rounded-full -ml-1"
                    style={{ left: `${pos}%` }}
                    title={ch.title}
                  />
                );
              })}
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-foreground hover:text-primary transition-colors">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={() => setMuted(!muted)} className="text-foreground hover:text-primary transition-colors">
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs text-foreground/70 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <button onClick={toggleFullscreen} className="text-foreground hover:text-primary transition-colors">
                {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big play button when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="glass squircle-xs p-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademyVideoPlayer;
