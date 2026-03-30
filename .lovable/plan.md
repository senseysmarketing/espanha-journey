

## Padronizar cards do Cita Hunter com o restante do app

### Problema
Os cards do Cita Hunter usam `glass-aurora` e `glow-aurora` para status "available" e `animate-sonar` para "monitoring", criando uma estética diferente das demais abas (como Jornada) que usam o estilo `glass` padrão.

### Alterações em `src/components/CitaHunter.tsx`

1. **Cards de trâmite (linha ~304):** Trocar as classes condicionais:
   - `glass-aurora glow-aurora` → `glass` (para available)
   - `glass animate-sonar` → `glass` (para monitoring)
   - Ambos mantêm `squircle-sm p-4`

2. **Banner de Insight (linha ~247):** Trocar `glass-aurora` → `glass` para consistência

Os indicadores de status (badge "Disponível" verde, ponto pulsante "Monitorando", botão "Agendar" laranja) permanecem inalterados — apenas o fundo dos cards muda.

### Arquivo afetado
| Arquivo | Ação |
|---|---|
| `src/components/CitaHunter.tsx` | Substituir `glass-aurora`/`glow-aurora`/`animate-sonar` por `glass` nos cards e banner |

