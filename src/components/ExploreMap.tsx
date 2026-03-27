import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import { X } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface POI {
  id: string;
  nome: string;
  categoria: string;
  latitude: number;
  longitude: number;
  descricao: string;
  cidade: string;
}

const poiData: POI[] = [
  // Madrid - Burocracia
  { id: "1", nome: "Oficina de Extranjería Madrid", categoria: "burocracia", latitude: 40.4237, longitude: -3.6914, descricao: "Tramitação de NIE e residência", cidade: "Madrid" },
  { id: "2", nome: "Centro de Salud Lavapiés", categoria: "burocracia", latitude: 40.4089, longitude: -3.7012, descricao: "Atendimento médico público", cidade: "Madrid" },
  { id: "3", nome: "Seguridad Social Madrid", categoria: "burocracia", latitude: 40.4200, longitude: -3.7050, descricao: "Registro na Seguridad Social", cidade: "Madrid" },
  // Madrid - Comunidade BR
  { id: "4", nome: "Boteco Madrid", categoria: "comunidade_br", latitude: 40.4205, longitude: -3.7100, descricao: "Comida brasileira autêntica", cidade: "Madrid" },
  { id: "5", nome: "Mercado Brasil Madrid", categoria: "comunidade_br", latitude: 40.4150, longitude: -3.6980, descricao: "Produtos brasileiros importados", cidade: "Madrid" },
  // Madrid - Lazer
  { id: "6", nome: "Parque del Retiro", categoria: "lazer", latitude: 40.4153, longitude: -3.6845, descricao: "Principal parque de Madrid", cidade: "Madrid" },
  // Barcelona
  { id: "7", nome: "Oficina Extranjería BCN", categoria: "burocracia", latitude: 41.3879, longitude: 2.1699, descricao: "NIE e residência", cidade: "Barcelona" },
  { id: "8", nome: "Sabor Brasil BCN", categoria: "comunidade_br", latitude: 41.3800, longitude: 2.1750, descricao: "Feijoada aos sábados", cidade: "Barcelona" },
  { id: "9", nome: "Park Güell", categoria: "lazer", latitude: 41.4145, longitude: 2.1527, descricao: "Parque modernista de Gaudí", cidade: "Barcelona" },
  { id: "10", nome: "La Barceloneta", categoria: "lazer", latitude: 41.3807, longitude: 2.1892, descricao: "Praia urbana", cidade: "Barcelona" },
  // Valencia
  { id: "11", nome: "Oficina Extranjería Valencia", categoria: "burocracia", latitude: 39.4700, longitude: -0.3750, descricao: "Tramitação de documentos", cidade: "Valencia" },
  { id: "12", nome: "Churrascaria Gaúcha", categoria: "comunidade_br", latitude: 39.4650, longitude: -0.3800, descricao: "Rodízio brasileiro", cidade: "Valencia" },
  { id: "13", nome: "Ciudad de las Artes", categoria: "lazer", latitude: 39.4537, longitude: -0.3517, descricao: "Complexo cultural futurista", cidade: "Valencia" },
  // Málaga
  { id: "14", nome: "Oficina Extranjería Málaga", categoria: "burocracia", latitude: 36.7200, longitude: -4.4200, descricao: "Documentação estrangeiros", cidade: "Málaga" },
  { id: "15", nome: "Brasil Tropical Málaga", categoria: "comunidade_br", latitude: 36.7190, longitude: -4.4250, descricao: "Restaurante e bar brasileiro", cidade: "Málaga" },
  { id: "16", nome: "Playa de la Malagueta", categoria: "lazer", latitude: 36.7170, longitude: -4.4100, descricao: "Praia urbana de Málaga", cidade: "Málaga" },
];

const categories = [
  { id: "burocracia", label: "🏛️ Burocracia", color: "hsl(var(--coral))" },
  { id: "comunidade_br", label: "🇧🇷 Brasil", color: "hsl(var(--journey-active))" },
  { id: "lazer", label: "🎉 Lazer", color: "hsl(var(--accent))" },
];

const categoryColors: Record<string, string> = {
  burocracia: "#e06050",
  comunidade_br: "#e8a030",
  lazer: "#40a0d0",
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
};

const ExploreMap = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(["burocracia", "comunidade_br", "lazer"]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  const toggleFilter = (id: string) => {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filteredPOIs = poiData.filter((p) => activeFilters.includes(p.categoria));

  return (
    <div className="relative -mx-4 -mt-2" style={{ height: "60vh" }}>
      {/* Map Z-0 */}
      <div className={`absolute inset-0 rounded-3xl overflow-hidden transition-all duration-300 ${selectedPOI ? "blur-sm" : ""}`}>
        <MapContainer
          center={[39.5, -2.5]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <MapResizer />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {filteredPOIs.map((poi) => (
            <CircleMarker
              key={poi.id}
              center={[poi.latitude, poi.longitude]}
              radius={8}
              pathOptions={{
                fillColor: categoryColors[poi.categoria],
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedPOI(poi);
                  if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
                },
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Filter toggles Z-10 */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-1.5">
        {categories.map((cat) => {
          const active = activeFilters.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleFilter(cat.id)}
              className={`glass squircle-xs px-3 py-1.5 text-[11px] font-medium transition-all ${
                active ? "border-primary/40 text-foreground" : "opacity-50 text-muted-foreground"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Detail card Z-50 */}
      <AnimatePresence>
        {selectedPOI && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-background/30 backdrop-blur-xl rounded-3xl"
              onClick={() => setSelectedPOI(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="absolute bottom-6 left-4 right-4 z-50 glass squircle p-5"
              style={{ boxShadow: "var(--glass-shadow-active)" }}
            >
              <button
                onClick={() => setSelectedPOI(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: categoryColors[selectedPOI.categoria] }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedPOI.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedPOI.cidade}</p>
                  <p className="text-xs text-foreground/80 mt-2">{selectedPOI.descricao}</p>
                  <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {categories.find((c) => c.id === selectedPOI.categoria)?.label}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreMap;
