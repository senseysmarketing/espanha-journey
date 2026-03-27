import { useState } from "react";
import { motion } from "framer-motion";

interface Bairro {
  nome: string;
  cidade: string;
  preco: number;
  tempo: number;
}

const bairros: Bairro[] = [
  { nome: "Centro", cidade: "Madrid", preco: 25.7, tempo: 0 },
  { nome: "Lavapiés", cidade: "Madrid", preco: 18.0, tempo: 5 },
  { nome: "Vicálvaro", cidade: "Madrid", preco: 14.4, tempo: 19 },
  { nome: "Eixample", cidade: "Barcelona", preco: 24.0, tempo: 0 },
  { nome: "Nou Barris", cidade: "Barcelona", preco: 20.5, tempo: 13 },
  { nome: "Ciutat Vella", cidade: "Valencia", preco: 15.0, tempo: 0 },
  { nome: "Patraix", cidade: "Valencia", preco: 12.0, tempo: 10 },
];

const cidadeCores: Record<string, string> = {
  Madrid: "hsl(var(--primary))",
  Barcelona: "hsl(var(--accent))",
  Valencia: "hsl(var(--journey-complete))",
};

const cidadeClasses: Record<string, string> = {
  Madrid: "bg-primary/15 text-primary",
  Barcelona: "bg-accent/15 text-accent",
  Valencia: "bg-green-500/15 text-green-400",
};

const NeighborhoodCompare = () => {
  const [cidadeFiltro, setCidadeFiltro] = useState<string | null>(null);
  const cidades = [...new Set(bairros.map((b) => b.cidade))];

  const filtered = cidadeFiltro ? bairros.filter((b) => b.cidade === cidadeFiltro) : bairros;

  const maxPreco = 28;
  const maxTempo = 22;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground">🧭 Bússola de Aluguel</h2>
      </div>

      {/* City filter */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setCidadeFiltro(null)}
          className={`glass squircle-xs px-3 py-1.5 text-xs font-medium transition-all ${
            !cidadeFiltro ? "border-primary/40 text-primary" : "text-muted-foreground"
          }`}
        >
          Todas
        </button>
        {cidades.map((c) => (
          <button
            key={c}
            onClick={() => setCidadeFiltro(c)}
            className={`glass squircle-xs px-3 py-1.5 text-xs font-medium transition-all ${
              cidadeFiltro === c ? "border-primary/40 text-primary" : "text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Scatter chart SVG */}
      <div className="glass squircle-sm p-4 mb-5">
        <div className="relative" style={{ height: 200 }}>
          {/* Axes labels */}
          <span className="absolute -left-1 top-0 text-[9px] text-muted-foreground rotate-0">€/m²</span>
          <span className="absolute bottom-[-18px] right-0 text-[9px] text-muted-foreground">min → centro</span>

          <svg viewBox="0 0 300 200" className="w-full h-full">
            {/* Grid */}
            <line x1="30" y1="10" x2="30" y2="180" stroke="hsla(220,10%,55%,0.2)" strokeWidth="1" />
            <line x1="30" y1="180" x2="290" y2="180" stroke="hsla(220,10%,55%,0.2)" strokeWidth="1" />

            {/* Y axis labels */}
            {[0, 10, 20, 30].map((v) => (
              <text key={v} x="25" y={180 - (v / maxPreco) * 165 + 4} textAnchor="end" fontSize="8" fill="hsla(220,10%,55%,0.6)">
                {v}€
              </text>
            ))}

            {/* X axis labels */}
            {[0, 5, 10, 15, 20].map((v) => (
              <text key={v} x={30 + (v / maxTempo) * 260} y="195" textAnchor="middle" fontSize="8" fill="hsla(220,10%,55%,0.6)">
                {v}m
              </text>
            ))}

            {/* Points */}
            {filtered.map((b, i) => {
              const x = 30 + (b.tempo / maxTempo) * 260;
              const y = 180 - (b.preco / maxPreco) * 165;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="6" fill={cidadeCores[b.cidade]} opacity="0.85" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill="hsla(0,0%,95%,0.8)">
                    {b.nome}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bairro cards */}
      <div className="space-y-2">
        {filtered.map((b, i) => (
          <motion.div
            key={b.nome + b.cidade}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass squircle-xs p-3 flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-medium text-foreground">{b.nome}</h3>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-0.5 ${cidadeClasses[b.cidade]}`}>
                {b.cidade}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{b.preco}€/m²</p>
              {b.tempo > 0 && (
                <p className="text-[10px] text-muted-foreground">🚇 {b.tempo} min ao centro</p>
              )}
              {b.tempo === 0 && (
                <p className="text-[10px] text-primary">📍 Centro</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NeighborhoodCompare;
