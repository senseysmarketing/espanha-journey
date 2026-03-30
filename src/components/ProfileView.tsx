import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, MapPin, LogOut, Settings, ChevronRight, RefreshCw, Globe, Heart, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const profiles = [
  {
    id: "nomade",
    icon: Globe,
    title: "Nômade Digital",
    desc: "Trabalho remoto com visto de nômade digital ou autônomo.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-400/30",
  },
  {
    id: "arraigo",
    icon: Heart,
    title: "Arraigo Social",
    desc: "Regularização após 3 anos de residência contínua.",
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-400/30",
  },
  {
    id: "nacionalidade",
    icon: Briefcase,
    title: "Nacionalidade",
    desc: "Cidadania espanhola por descendência ou residência.",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-400/30",
  },
];

interface ProfileViewProps {
  onChangeProfile?: (profile: string) => void;
  selectedProfile?: string | null;
}

const ProfileView = ({ onChangeProfile, selectedProfile }: ProfileViewProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const { signOut } = useAuth();

  const currentProfile = profiles.find((p) => p.id === selectedProfile);

  const handleSelect = (id: string) => {
    onChangeProfile?.(id);
    setShowDialog(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 mx-auto mb-4 flex items-center justify-center border border-primary/20"
        >
          <User className="w-12 h-12 text-foreground/60" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Brasileiro na Espanha</h1>
        <p className="text-muted-foreground mt-1">
          {currentProfile ? currentProfile.title : "Nômade Digital"} · Madrid
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {[
          { label: "Dias", value: "72", icon: Calendar },
          { label: "Tarefas", value: "2/6", icon: MapPin },
          { label: "Docs", value: "3", icon: User },
        ].map((stat, i) => (
          <div key={i} className="glass squircle-xs p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass squircle-sm overflow-hidden"
      >
        {[
          { icon: RefreshCw, label: "Trocar Caminho", desc: currentProfile ? currentProfile.title : "Selecionar", action: () => setShowDialog(true) },
          { icon: Settings, label: "Configurações", desc: "Idioma, notificações" },
          { icon: Calendar, label: "Data de Entrada", desc: "15 Jan 2025" },
          { icon: LogOut, label: "Sair", desc: "Encerrar sessão", action: () => signOut() },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left border-b border-border/30 last:border-0"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </motion.div>

      {/* Dialog to change path */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Trocar Caminho</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  selectedProfile === p.id
                    ? `glass-active ${p.borderColor} glow-primary`
                    : "glass border-border/50 hover:border-muted-foreground/30"
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${p.color}`}>
                  <p.icon className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-sm text-muted-foreground">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileView;
