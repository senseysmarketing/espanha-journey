import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Minimize2, Maximize2, X } from "lucide-react";

interface MilestoneVideoPlayerProps {
  videoUrl: string;
  title: string;
}

const MilestoneVideoPlayer = ({ videoUrl, title }: MilestoneVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMini = () => {
    setIsMini(!isMini);
    if (navigator.vibrate) navigator.vibrate(5);
  };

  const closeMini = () => {
    setIsMini(false);
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
  };

  if (isMini) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="fixed bottom-24 right-6 z-50 w-56 glass squircle-sm overflow-hidden glow-aurora"
      >
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[10px] font-medium text-foreground truncate">{title}</span>
          <div className="flex items-center gap-1">
            <button onClick={toggleMini} className="p-1">
              <Maximize2 className="w-3 h-3 text-muted-foreground" />
            </button>
            <button onClick={closeMini} className="p-1">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video bg-secondary"
            playsInline
            src={videoUrl}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-background/30"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-foreground" />
            ) : (
              <Play className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 bg-secondary/30">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full aspect-video bg-secondary"
          playsInline
          src={videoUrl}
          onEnded={() => setIsPlaying(false)}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-12 h-12 rounded-full glass flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-foreground" />
            ) : (
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            )}
          </motion.button>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <p className="text-xs font-medium text-foreground">Vídeo do Mentor</p>
          <p className="text-[10px] text-muted-foreground">{title}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMini}
          className="p-1.5 rounded-lg glass"
        >
          <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
      </div>
    </div>
  );
};

export default MilestoneVideoPlayer;
