import { motion } from "framer-motion";
import { Map, FolderLock, Bell, Shield, Globe, Bot, User } from "lucide-react";

const dockItems = [
  { icon: Map, label: "Jornada", id: "journey" },
  { icon: FolderLock, label: "Cofre", id: "vault" },
  { icon: Bell, label: "Cita", id: "cita" },
  { icon: Shield, label: "Segurança", id: "security" },
  { icon: Globe, label: "Explorar", id: "explore" },
  { icon: Bot, label: "IA", id: "ai" },
  { icon: User, label: "Perfil", id: "profile" },
];

interface FloatingDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FloatingDock = ({ activeTab, onTabChange }: FloatingDockProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
      className="fixed bottom-6 left-1/2 z-50"
    >
      <div className="glass-dock squircle-sm flex items-center gap-1 px-3 py-2.5">
        {dockItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="dock-active"
                  className="absolute inset-0 bg-primary/15 rounded-2xl border border-primary/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={`relative z-10 w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FloatingDock;
