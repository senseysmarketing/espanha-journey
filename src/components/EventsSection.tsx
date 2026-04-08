import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Ticket, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  price_cents: number;
  currency: string;
  max_capacity: number | null;
  stripe_price_id: string | null;
  recurrence: string | null;
}

interface RSVP {
  event_id: string;
  status: string;
  ticket_code: string | null;
}

const categoryMeta: Record<string, { label: string; color: string; emoji: string }> = {
  resenha: { label: "Gratuito", color: "hsl(145,60%,42%)", emoji: "🤝" },
  formacao: { label: "Formação", color: "hsl(21,100%,41%)", emoji: "🎓" },
  jantar: { label: "Networking VIP", color: "hsl(17,100%,30%)", emoji: "🍷" },
};

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (eventsData) setEvents(eventsData as Event[]);

    if (user) {
      const { data: rsvpData } = await supabase
        .from("event_rsvps")
        .select("event_id, status, ticket_code")
        .eq("user_id", user.id);

      if (rsvpData) setRsvps(rsvpData);
    }

    // Fetch counts for capacity-limited events
    if (eventsData) {
      const counts: Record<string, number> = {};
      for (const ev of eventsData) {
        if ((ev as Event).max_capacity) {
          const { count } = await supabase
            .from("event_rsvps")
            .select("*", { count: "exact", head: true })
            .eq("event_id", ev.id)
            .in("status", ["confirmed", "paid"]);
          counts[ev.id] = count ?? 0;
        }
      }
      setRsvpCounts(counts);
    }

    setLoading(false);
  };

  const handleRSVP = async (eventId: string) => {
    if (!user) return;
    setActionLoading(eventId);
    try {
      const existing = rsvps.find((r) => r.event_id === eventId);
      if (existing) {
        await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
        setRsvps((prev) => prev.filter((r) => r.event_id !== eventId));
        toast.success("Presença cancelada");
      } else {
        await supabase.from("event_rsvps").insert({
          event_id: eventId,
          user_id: user.id,
          status: "confirmed",
        });
        setRsvps((prev) => [...prev, { event_id: eventId, status: "confirmed", ticket_code: null }]);
        toast.success("Presença confirmada! 🎉");
      }
    } catch {
      toast.error("Erro ao confirmar presença");
    }
    setActionLoading(null);
  };

  const handleCheckout = async (eventId: string) => {
    if (!user) return;
    setActionLoading(eventId);
    try {
      const { data, error } = await supabase.functions.invoke("create-event-checkout", {
        body: { event_id: eventId },
      });

      if (error) throw error;
      if (data?.sold_out) {
        toast.error("Evento esgotado!");
        await fetchData();
        return;
      }
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar pagamento");
    }
    setActionLoading(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (cents: number, currency: string) => {
    if (cents === 0) return "Gratuito";
    const amount = cents / 100;
    return currency === "eur" ? `€${amount}` : `R$${amount}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-32 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground">Eventos</h1>
        <p className="text-foreground/70 mt-1">Comunidade, formação e networking.</p>
      </motion.div>

      <div className="space-y-5">
        {events.map((ev, i) => {
          const meta = categoryMeta[ev.category] || categoryMeta.resenha;
          const myRsvp = rsvps.find((r) => r.event_id === ev.id);
          const isLoading = actionLoading === ev.id;
          const count = rsvpCounts[ev.id] ?? 0;
          const isSoldOut = ev.max_capacity ? count >= ev.max_capacity : false;
          const spotsLeft = ev.max_capacity ? ev.max_capacity - count : null;

          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass squircle-sm p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{ev.title}</h3>
                    <span
                      className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>
                <span className="font-heading text-xl font-bold" style={{ color: meta.color }}>
                  {formatPrice(ev.price_cents, ev.currency)}
                </span>
              </div>

              <p className="text-foreground/70 text-sm leading-relaxed">{ev.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{formatDate(ev.date)}</span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{ev.location}</span>
                  </div>
                )}
                {spotsLeft !== null && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{isSoldOut ? "Esgotado" : `${spotsLeft} vagas restantes`}</span>
                  </div>
                )}
              </div>

              {/* Ticket code for paid events */}
              {myRsvp?.ticket_code && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-journey-complete/10 border border-journey-complete/20">
                  <Ticket className="w-5 h-5 text-journey-complete" />
                  <span className="text-sm font-semibold text-journey-complete">
                    Ticket: {myRsvp.ticket_code}
                  </span>
                </div>
              )}

              {/* Action button */}
              {ev.category === "resenha" ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRSVP(ev.id)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    myRsvp
                      ? "bg-journey-complete/15 text-journey-complete border border-journey-complete/30"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : myRsvp ? (
                    <>
                      <Check className="w-4 h-4" /> Presença confirmada
                    </>
                  ) : (
                    "Confirmar Presença"
                  )}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckout(ev.id)}
                  disabled={isLoading || isSoldOut || !!myRsvp}
                  className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    myRsvp
                      ? "bg-journey-complete/15 text-journey-complete border border-journey-complete/30"
                      : isSoldOut
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : myRsvp ? (
                    <>
                      <Check className="w-4 h-4" /> Inscrito
                    </>
                  ) : isSoldOut ? (
                    "Esgotado"
                  ) : (
                    `Comprar — ${formatPrice(ev.price_cents, ev.currency)}`
                  )}
                </motion.button>
              )}

              {ev.recurrence === "biweekly_sunday" && (
                <p className="text-xs text-foreground/40 text-center">
                  📅 Evento quinzenal aos domingos
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsSection;
