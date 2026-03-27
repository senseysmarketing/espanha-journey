import { motion } from "framer-motion";
import { User, Calendar, MapPin, LogOut, Settings, ChevronRight } from "lucide-react";

const ProfileView = () => {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 mx-auto mb-4 flex items-center justify-center border border-primary/20"
        >
          <User className="w-12 h-12 text-foreground/60" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Brasileiro na Espanha</h1>
        <p className="text-muted-foreground mt-1">Nômade Digital · Madrid</p>
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
          { icon: Settings, label: "Configurações", desc: "Idioma, notificações" },
          { icon: Calendar, label: "Data de Entrada", desc: "15 Jan 2025" },
          { icon: LogOut, label: "Sair", desc: "Encerrar sessão" },
        ].map((item, i) => (
          <button
            key={i}
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
    </div>
  );
};

export default ProfileView;
