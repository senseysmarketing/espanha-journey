import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X } from "lucide-react";

const MentorTipButton = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePiP = async () => {
    if (showVideo && videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (e) {
        console.log("PiP not supported");
      }
    } else {
      setShowVideo(true);
    }
  };

  return (
    <>
      <motion.button
        onClick={handlePiP}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 z-50 glass squircle-xs w-12 h-12 flex items-center justify-center glow-primary"
      >
        <GraduationCap className="w-5 h-5 text-primary" />
      </motion.button>

      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-40 right-6 z-50 glass squircle-sm overflow-hidden w-72"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-foreground">Dica do Mentor</span>
              <button onClick={() => setShowVideo(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <video
              ref={videoRef}
              className="w-full aspect-video bg-secondary"
              controls
              playsInline
              poster=""
            >
              <source src="" type="video/mp4" />
              Seu navegador não suporta vídeo.
            </video>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MentorTipButton;
