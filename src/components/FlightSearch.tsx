import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Luggage, ArrowRight } from "lucide-react";

interface Flight {
  id: string;
  origem: string;
  origemCode: string;
  destino: string;
  destinoCode: string;
  companhia: string;
  preco: number;
  direto: boolean;
  bagagem: boolean;
  duracao: string;
  escala?: string;
}

const flights: Flight[] = [
  { id: "1", origem: "São Paulo", origemCode: "GRU", destino: "Madrid", destinoCode: "MAD", companhia: "Iberia", preco: 3250, direto: true, bagagem: true, duracao: "10h30" },
  { id: "2", origem: "São Paulo", origemCode: "GRU", destino: "Madrid", destinoCode: "MAD", companhia: "LATAM", preco: 2890, direto: true, bagagem: true, duracao: "10h45" },
  { id: "3", origem: "São Paulo", origemCode: "GRU", destino: "Barcelona", destinoCode: "BCN", companhia: "Air Europa", preco: 2650, direto: false, bagagem: true, duracao: "14h20", escala: "Madrid" },
  { id: "4", origem: "Rio de Janeiro", origemCode: "GIG", destino: "Madrid", destinoCode: "MAD", companhia: "Iberia", preco: 3100, direto: true, bagagem: true, duracao: "10h15" },
  { id: "5", origem: "Rio de Janeiro", origemCode: "GIG", destino: "Barcelona", destinoCode: "BCN", companhia: "TAP", preco: 2480, direto: false, bagagem: true, duracao: "15h30", escala: "Lisboa" },
  { id: "6", origem: "Brasília", origemCode: "BSB", destino: "Madrid", destinoCode: "MAD", companhia: "LATAM", preco: 3400, direto: false, bagagem: true, duracao: "16h", escala: "São Paulo" },
  { id: "7", origem: "São Paulo", origemCode: "GRU", destino: "Málaga", destinoCode: "AGP", companhia: "Ryanair + LATAM", preco: 2200, direto: false, bagagem: false, duracao: "16h40", escala: "Madrid" },
];

const FlightSearch = () => {
  const [filterDireto, setFilterDireto] = useState(false);
  const [filterBagagem, setFilterBagagem] = useState(false);
  const [filterOrigem, setFilterOrigem] = useState<string | null>(null);

  const origens = [...new Set(flights.map((f) => f.origem))];

  const filtered = flights.filter((f) => {
    if (filterDireto && !f.direto) return false;
    if (filterBagagem && !f.bagagem) return false;
    if (filterOrigem && f.origem !== filterOrigem) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground">✈️ Rotas de Imigração</h2>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Melhores rotas Brasil → Espanha com foco em bagagem e voos diretos
      </p>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setFilterOrigem(null)}
          className={`glass squircle-xs px-3 py-1.5 text-xs font-medium transition-all ${
            !filterOrigem ? "border-primary/40 text-primary" : "text-muted-foreground"
          }`}
        >
          Todas
        </button>
        {origens.map((o) => (
          <button
            key={o}
            onClick={() => setFilterOrigem(o)}
            className={`glass squircle-xs px-3 py-1.5 text-xs font-medium transition-all ${
              filterOrigem === o ? "border-primary/40 text-primary" : "text-muted-foreground"
            }`}
          >
            {o}
          </button>
        ))}
        <button
          onClick={() => setFilterDireto(!filterDireto)}
          className={`glass squircle-xs px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1 ${
            filterDireto ? "border-primary/40 text-primary" : "text-muted-foreground"
          }`}
        >
          <Plane className="w-3 h-3" /> Direto
        </button>
        <button
          onClick={() => setFilterBagagem(!filterBagagem)}
          className={`glass squircle-xs px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1 ${
            filterBagagem ? "border-primary/40 text-primary" : "text-muted-foreground"
          }`}
        >
          <Luggage className="w-3 h-3" /> Bagagem
        </button>
      </div>

      {/* Flight cards */}
      <div className="space-y-3">
        {filtered.map((flight, i) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass squircle-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-muted-foreground">{flight.companhia}</span>
              <div className="flex gap-1">
                {flight.direto && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">
                    VOO DIRETO
                  </span>
                )}
                {flight.bagagem && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">
                    BAGAGEM
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{flight.origemCode}</p>
                <p className="text-[10px] text-muted-foreground">{flight.origem}</p>
              </div>

              <div className="flex-1 flex items-center gap-1 px-2">
                <div className="flex-1 h-px bg-border" />
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{flight.destinoCode}</p>
                <p className="text-[10px] text-muted-foreground">{flight.destino}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
              <div className="flex gap-3">
                <span className="text-[10px] text-muted-foreground">⏱ {flight.duracao}</span>
                {flight.escala && (
                  <span className="text-[10px] text-muted-foreground">🔄 Escala: {flight.escala}</span>
                )}
              </div>
              <p className="text-base font-bold text-gradient-primary">R$ {flight.preco.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Nenhum voo encontrado com estes filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
