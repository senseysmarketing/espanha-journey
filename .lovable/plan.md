

## Cita Hunter Funcional — Plano de Implementação

### 1. Migration SQL

**Adicionar colunas ao `profiles`:**
- `provincia text` — província selecionada
- `whatsapp_alerts boolean DEFAULT false` — toggle de notificações

**Criar tabela `cita_monitoring`:**
- `id uuid PK`, `provincia text NOT NULL`, `tramite text NOT NULL` (TIE, NIE, Huellas, Alta Autónomo, Empadronamiento)
- `office_name text`, `office_lat numeric`, `office_lng numeric`
- `status text DEFAULT 'monitoring'` (monitoring | available)
- `available_date date`, `booking_url text`
- `created_at`, `updated_at` timestamps
- RLS: SELECT para authenticated, sem INSERT/UPDATE/DELETE (dados populados por bot externo)
- Habilitar realtime na tabela para broadcast

**Seed de dados de demonstração:** Inserir ~8 registros para Madrid, Barcelona e Valencia com trâmites variados, alguns em `available` com datas e coordenadas reais das oficinas.

### 2. Reescrever `src/components/CitaHunter.tsx`

**Fluxo condicional:**
- Carregar `profiles.provincia` via query com `useAuth().user.id`
- Se `provincia` é null → card glass central com Select das 52 províncias espanholas. Ao selecionar, faz `UPDATE profiles SET provincia = X`
- Se `provincia` definida → exibir radar completo

**Banner de Insights (topo):**
- Objeto `Record<string, string>` com dicas por província (ex: Madrid → "segundas de manhã", Barcelona → "quintas às 09:00")
- Estilo `glass-aurora` com ícone de Lightbulb

**Cards de trâmite:**
- Query `cita_monitoring` filtrado pela `provincia`
- Ícones específicos: Fingerprint para Huellas, CreditCard para TIE, FileText para NIE, Briefcase para Alta Autónomo, Home para Empadronamiento
- **Status `monitoring`:** Borda com animação `sonar` (CSS keyframe — box-shadow pulsante expandindo)
- **Status `available`:** Estilo `glass-aurora` + `glow-aurora`, Vibration API ao aparecer, data formatada, botão "Agendar" (min 44px touch target) que abre URL oficial com parâmetros da província

**Geolocalização:**
- `navigator.geolocation.getCurrentPosition` no mount
- Função Haversine inline para calcular distância
- Exibir "A X.X km de você" em cada card com coordenadas

**Toggle WhatsApp:**
- Switch no topo/rodapé que salva `profiles.whatsapp_alerts`

**Realtime:**
- `supabase.channel('cita_monitoring').on('postgres_changes', { event: '*', table: 'cita_monitoring', filter: 'provincia=eq.{provincia}' })` para atualizar estado local em tempo real
- Cleanup no useEffect return

### 3. CSS — `src/index.css`

Adicionar `@keyframes sonar`:
```css
@keyframes sonar {
  0% { box-shadow: 0 0 0 0 hsla(32, 95%, 55%, 0.4); }
  70% { box-shadow: 0 0 0 12px hsla(32, 95%, 55%, 0); }
  100% { box-shadow: 0 0 0 0 hsla(32, 95%, 55%, 0); }
}
.animate-sonar { animation: sonar 2s infinite; }
```

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar `cita_monitoring`, adicionar `provincia` e `whatsapp_alerts` em `profiles`, seed data |
| `src/components/CitaHunter.tsx` | Reescrever completamente |
| `src/index.css` | Adicionar keyframes sonar |

