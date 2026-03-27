

## Módulo de Relocation e Experiência — Espanha Pass

### Visão Geral

Nova aba "Explorar" no Floating Dock com 4 sub-módulos: IA Concierge de Destinos (chat real com streaming), Mapa Interativo Leaflet, Comparador de Bairros "Bússola de Aluguel" e Smart Flight Search. Design Apple 2025 com hierarquia de eixo Z (mapa Z-0, filtros Z-10, cards Z-50), Liquid Glass com refração SVG, e Divulgação Progressiva.

---

### 1. Backend Supabase

**Migration — Tabelas `city_data` e `poi_locations`:**

```sql
CREATE TABLE public.city_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  custo_vida_medio numeric,
  clima text,
  seguranca_index numeric,
  latitude numeric,
  longitude numeric,
  foto_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.poi_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL, -- 'burocracia', 'comunidade_br', 'lazer'
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  descricao text,
  cidade text,
  created_at timestamptz DEFAULT now()
);

-- RLS: leitura pública para usuários autenticados
ALTER TABLE public.city_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poi_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cities" ON public.city_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view POIs" ON public.poi_locations FOR SELECT TO authenticated USING (true);
```

**Seed data** (via insert tool): Madrid, Barcelona, Valencia, Málaga, Sevilla com coordenadas, custo de vida e POIs reais por categoria (Oficinas de Extranjería, restaurantes brasileiros, mercados, centros de saúde).

**Edge Function `city-concierge`:**
- Streaming SSE via Lovable AI Gateway (`google/gemini-3-flash-preview`)
- System prompt focado em recomendações de cidades espanholas para imigrantes brasileiros
- Recebe `{ messages, budget?, lifestyle? }` — retorna stream de tokens
- Tratamento de erros 429/402
- Adicionado ao `supabase/config.toml`

---

### 2. Navegação

**`FloatingDock.tsx`**: Adicionar aba "Explorar" com ícone `Globe` posicionada entre "Segurança" e "IA".

**`Index.tsx`**: Importar `ExploreSection` e mapear `explore: ExploreSection` no `tabComponents`.

---

### 3. Componentes Frontend

#### 3.1 `ExploreSection.tsx` — Container Principal
- Layout `max-w-lg mx-auto px-4 py-8 pb-32` (padrão do app)
- Pill tabs internas: "Concierge", "Mapa", "Bairros", "Passagens"
- Animação local (sem `layoutId` para evitar conflito com AnimatePresence do pai)
- Divulgação Progressiva: ao entrar, mostra o mapa limpo; sub-módulos revelam-se conforme interação

#### 3.2 `ExploreConcierge.tsx` — Chat "Match de Cidade"
- Interface de chat imersiva com streaming real via edge function `city-concierge`
- Quick-actions no topo: botões de orçamento (1.500€, 2.000€, 3.000€) e perfil (Trabalho Remoto, Família, Estudante)
- Mensagens renderizadas com `react-markdown`
- Quando a IA mencionar uma cidade presente em `city_data`, exibir card Liquid Glass flutuante com: foto, custo de vida médio e índice de segurança
- Detecção de cidades por regex simples no texto da resposta

#### 3.3 `ExploreMap.tsx` — Mapa Interativo Leaflet
- Mapa fullscreen da Espanha com tiles OpenStreetMap (estilo claro "Soft Mediterranean" via tile provider gratuito)
- `react-leaflet` + `leaflet` (novas dependências)
- **Camadas de filtro** (toggles flutuantes em Z-10 com Liquid Glass):
  - "Burocracia" — Oficinas de Extranjería, Centros de Saúde
  - "Brasil na Espanha" — Restaurantes e mercados brasileiros
- Pins com markers customizados (círculos coloridos por categoria, estilo Apple)
- Ao clicar pin: animação spring (`type: "spring"`) abre card de detalhe em Z-50 com `backdrop-blur-xl` no overlay
- Haptic feedback no mobile ao trocar filtro (`navigator.vibrate`)
- Dados carregados de `poi_locations` via Supabase client

#### 3.4 `NeighborhoodCompare.tsx` — "Bússola de Aluguel"
- Widget visual comparando Preço/m² vs Tempo ao Centro (metro)
- Dados reais hardcoded:
  - Madrid: Centro (25,7€/m²), Vicálvaro (14,4€/m², 19min), Lavapiés (18€/m², 5min)
  - Barcelona: Eixample (24€/m²), Nou Barris (20,5€/m², 13min)
  - Valencia: Ciutat Vella (15€/m²), Patraix (12€/m², 10min)
- Scatter chart em SVG puro (sem lib de charts)
- Cards Liquid Glass para cada bairro, ordenáveis

#### 3.5 `FlightSearch.tsx` — Smart Flight Search
- Cards Liquid Glass com rotas mock Brasil→Espanha:
  - GRU→MAD (Iberia, Latam), GIG→BCN (Air Europa), BSB→MAD
- Filtros visuais: cidade origem, "Voo Direto", "Bagagem Inclusa"
- Badges destacados para voos diretos e bagagem
- Preços simulados realistas

---

### 4. Diretriz de Design (Eixo Z)

```text
Z-50  ┌──────────────────┐  Cards de detalhe / Chat overlay
      │  glass + squircle │  box-shadow profunda, backdrop-blur-xl
      └──────────────────┘
Z-10  ┌──────────────────┐  Filtros do mapa (toggles)
      │  glass-dock style │  posição absolute sobre o mapa
      └──────────────────┘
Z-0   ┌──────────────────┐  Mapa Leaflet (base)
      │  fullscreen tiles │  blur quando card Z-50 aberto
      └──────────────────┘
```

- Overlays sobre o mapa usam classe `glass` com refração SVG (`refraction-filter`)
- Bordas Squircle (32px) em todos os cards
- Sombras profundas nos cards Z-50: `var(--glass-shadow-active)`
- Haptic feedback: `navigator.vibrate([10, 30, 10])` ao trocar filtro ou selecionar destino

---

### 5. Dependências

- `leaflet`, `react-leaflet`, `@types/leaflet`
- `react-markdown`

### 6. Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabelas `city_data`, `poi_locations` |
| Insert SQL | Seed com cidades e POIs reais |
| `supabase/functions/city-concierge/index.ts` | Criar |
| `supabase/config.toml` | Adicionar `[functions.city-concierge]` |
| `src/components/ExploreSection.tsx` | Criar |
| `src/components/ExploreConcierge.tsx` | Criar |
| `src/components/ExploreMap.tsx` | Criar |
| `src/components/NeighborhoodCompare.tsx` | Criar |
| `src/components/FlightSearch.tsx` | Criar |
| `src/components/FloatingDock.tsx` | Adicionar tab "Explorar" |
| `src/pages/Index.tsx` | Adicionar `explore: ExploreSection` |

**Nota**: Auth não está implementada. RLS exige `authenticated` — funcionalidades completas dependem de login futuro. O chat IA funciona sem auth (edge function pública).

---

## Módulo de Relocation e Experiência

### Implementado
- Tabelas `city_data` e `poi_locations` criadas com RLS
- Edge function `city-concierge` (streaming SSE via Lovable AI Gateway)
- Aba "Explorar" (Globe) no Floating Dock
- 4 sub-módulos: Concierge IA, Mapa Leaflet, Bússola de Aluguel, Rotas de Passagens
- Design Liquid Glass com hierarquia Z (mapa Z-0, filtros Z-10, cards Z-50)
- Haptic feedback no mobile
