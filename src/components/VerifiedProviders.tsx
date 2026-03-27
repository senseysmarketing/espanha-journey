import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Play, Star, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Provider {
  id: string;
  name: string;
  category: string;
  description: string;
  selo_status: string;
  rating: number;
  link_afiliado: string;
  video_url: string | null;
  avatar_url: string | null;
}

const VerifiedProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase
        .from("verified_providers")
        .select("*")
        .order("rating", { ascending: false });
      if (data) setProviders(data as Provider[]);
    };
    fetchProviders();
  }, []);

  const bentoSpans = ["md:col-span-2", "md:col-span-1", "md:col-span-1", "md:col-span-2", "md:col-span-1"];

  return (
    <div className="px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider, idx) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass squircle-sm p-5 flex flex-col gap-3 ${bentoSpans[idx % bentoSpans.length]}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                  {provider.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{provider.name}</h4>
                  <p className="text-muted-foreground text-xs">{provider.category}</p>
                </div>
              </div>
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <BadgeCheck className="w-5 h-5 text-journey-complete" />
              </motion.div>
            </div>

            {/* Description */}
            <p className="text-foreground/80 text-xs leading-relaxed flex-1">{provider.description}</p>

            {/* Video placeholder */}
            <div className="glass-active squircle-xs h-20 flex items-center justify-center gap-2 cursor-pointer hover:border-primary/30 transition-colors">
              <Play className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Vídeo de apresentação</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-foreground text-xs font-medium">{provider.rating}</span>
              </div>
              <a
                href={provider.link_afiliado}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Conhecer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VerifiedProviders;
