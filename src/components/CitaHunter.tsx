import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellRing, MapPin, Clock, CheckCircle, Lightbulb,
  Fingerprint, CreditCard, FileText, Briefcase, Home,
  Navigation, ExternalLink, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const PROVINCIAS = [
  "Álava","Albacete","Alicante","Almería","Asturias","Ávila","Badajoz","Barcelona",
  "Burgos","Cáceres","Cádiz","Cantabria","Castellón","Ciudad Real","Córdoba","A Coruña",
  "Cuenca","Girona","Granada","Guadalajara","Guipúzcoa","Huelva","Huesca","Illes Balears",
  "Jaén","León","Lleida","Lugo","Madrid","Málaga","Murcia","Navarra","Ourense","Palencia",
  "Las Palmas","Pontevedra","La Rioja","Salamanca","Santa Cruz de Tenerife","Segovia",
  "Sevilla","Soria","Tarragona","Teruel","Toledo","Valencia","Valladolid","Vizcaya",
  "Zamora","Zaragoza","Ceuta","Melilla"
];

const INSIGHTS: Record<string, string> = {
  Madrid: "Madrid costuma liberar vagas às segundas de manhã. Fique atento entre 08:00 e 10:00!",
  Barcelona: "Barcelona costuma liberar vagas de Huellas nas quintas às 09:00. Fique atento!",
  Valencia: "Valencia atualiza disponibilidade às terças e quintas. Monitore de manhã cedo!",
};
const DEFAULT_INSIGHT = "Dica: As vagas costumam ser liberadas pela manhã. Ative as notificações para não perder!";

const TRAMITE_ICONS: Record<string, typeof Fingerprint> = {
  Huellas: Fingerprint,
  TIE: CreditCard,
  NIE: FileText,
  "Alta Autónomo": Briefcase,
  Empadronamiento: Home,
};

interface CitaRow {
  id: string;
  provincia: string;
  tramite: string;
  office_name: string;
  office_lat: number | null;
  office_lng: number | null;
  status: string;
  available_date: string | null;
  booking_url: string | null;
  updated_at: string | null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function triggerHaptic() {
  if ("vibrate" in navigator) navigator.vibrate(50);
}

const CitaHunter = () => {
  const { user } = useAuth();
  const [provincia, setProvincia] = useState<string | null>(null);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectingProvincia, setSelectingProvincia] = useState<string>("");

  // Load profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("provincia, whatsapp_alerts")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProvincia((data as any).provincia ?? null);
          setWhatsappAlerts((data as any).whatsapp_alerts ?? false);
        }
        setLoading(false);
      });
  }, [user]);

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Load citas for provincia
  useEffect(() => {
    if (!provincia) return;
    supabase
      .from("cita_monitoring")
      .select("*")
      .eq("provincia", provincia)
      .then(({ data }) => {
        if (data) setCitas(data as unknown as CitaRow[]);
      });
  }, [provincia]);

  // Realtime subscription
  useEffect(() => {
    if (!provincia) return;
    const channel = supabase
      .channel("cita_changes")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "cita_monitoring", filter: `provincia=eq.${provincia}` },
        (payload: any) => {
          const newRow = payload.new as CitaRow;
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            setCitas((prev) => {
              const idx = prev.findIndex((c) => c.id === newRow.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = newRow;
                if (newRow.status === "available") triggerHaptic();
                return updated;
              }
              return [...prev, newRow];
            });
          } else if (payload.eventType === "DELETE") {
            setCitas((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [provincia]);

  const saveProvincia = useCallback(async (val: string) => {
    if (!user) return;
    await supabase.from("profiles").update({ provincia: val } as any).eq("user_id", user.id);
    setProvincia(val);
    toast.success(`Província definida: ${val}`);
    triggerHaptic();
  }, [user]);

  const toggleWhatsapp = useCallback(async (val: boolean) => {
    if (!user) return;
    setWhatsappAlerts(val);
    await supabase.from("profiles").update({ whatsapp_alerts: val } as any).eq("user_id", user.id);
    toast.success(val ? "Notificações WhatsApp ativadas" : "Notificações desativadas");
    triggerHaptic();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Province selector screen
  if (!provincia) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <BellRing className="w-7 h-7 text-primary" /> Cita Hunter
          </h1>
          <p className="text-muted-foreground">Monitoramento inteligente de agendamentos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-active squircle-sm p-8 text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Onde você vai residir na Espanha?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Selecione sua província para começarmos a monitorar vagas de agendamento na sua região.
          </p>

          <Select value={selectingProvincia} onValueChange={setSelectingProvincia}>
            <SelectTrigger className="w-full bg-secondary/50 border-border/50 h-12 text-base">
              <SelectValue placeholder="Selecione a província..." />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {PROVINCIAS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectingProvincia && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => saveProvincia(selectingProvincia)}
              className="mt-5 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-2xl text-base min-h-[44px]"
            >
              Confirmar e Monitorar
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  // Main radar view
  const insight = INSIGHTS[provincia] || DEFAULT_INSIGHT;
  const availableCount = citas.filter((c) => c.status === "available").length;

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-1 flex items-center justify-center gap-2">
          <BellRing className="w-7 h-7 text-primary" /> Cita Hunter
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" /> {provincia}
          <button
            onClick={() => setProvincia(null)}
            className="text-primary text-xs underline ml-1"
          >
            Alterar
          </button>
        </div>
      </motion.div>

      {/* Insight banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass squircle-sm p-4 mb-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-1">Insight do Hunter</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </div>
        </div>
      </motion.div>

      {/* Status summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-2">
          {availableCount > 0 ? (
            <span className="px-3 py-1.5 rounded-xl bg-journey-complete/15 text-journey-complete text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {availableCount} vaga{availableCount > 1 ? "s" : ""} disponíve{availableCount > 1 ? "is" : "l"}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-secondary/50 text-muted-foreground text-xs font-medium">
              Monitorando...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">WhatsApp</span>
          <Switch checked={whatsappAlerts} onCheckedChange={toggleWhatsapp} />
        </div>
      </motion.div>

      {/* Cita cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {citas.map((cita, i) => {
            const Icon = TRAMITE_ICONS[cita.tramite] || FileText;
            const isAvailable = cita.status === "available";
            const distance =
              userCoords && cita.office_lat && cita.office_lng
                ? haversineKm(userCoords.lat, userCoords.lng, cita.office_lat, cita.office_lng)
                : null;

            return (
              <motion.div
                key={cita.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.06 * i }}
                className="glass squircle-sm p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isAvailable ? "bg-journey-complete/15" : "bg-primary/10"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isAvailable ? "text-journey-complete" : "text-primary"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{cita.tramite}</h3>
                      {isAvailable ? (
                        <span className="flex items-center gap-1 text-xs text-journey-complete font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Disponível
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          Monitorando
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground truncate">{cita.office_name}</p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {distance !== null && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> A {distance.toFixed(1)} km de você
                        </span>
                      )}
                      {isAvailable && cita.available_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(cita.available_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>

                    {isAvailable && cita.booking_url && (
                      <motion.a
                        href={cita.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: 0.97 }}
                        className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl min-h-[44px]"
                      >
                        <ExternalLink className="w-4 h-4" /> Agendar Agora
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {citas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass squircle-sm p-8 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Nenhum trâmite sendo monitorado para {provincia} ainda.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CitaHunter;
