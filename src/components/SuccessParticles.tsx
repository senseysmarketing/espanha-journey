import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
}

const AURORA_COLORS = [
  "hsla(180, 80%, 55%, 0.9)",
  "hsla(270, 70%, 55%, 0.9)",
  "hsla(330, 80%, 55%, 0.9)",
  "hsla(200, 80%, 60%, 0.9)",
  "hsla(290, 70%, 60%, 0.9)",
];

interface SuccessParticlesProps {
  trigger: boolean;
  onComplete?: () => void;
}

const SuccessParticles = ({ trigger, onComplete }: SuccessParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

    const newParticles: Particle[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      color: AURORA_COLORS[i % AURORA_COLORS.length],
      size: 4 + Math.random() * 6,
      angle: (360 / 16) * i + (Math.random() * 20 - 10),
      distance: 40 + Math.random() * 60,
    }));

    setParticles(newParticles);
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 0.3, x: tx, y: ty }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessParticles;
