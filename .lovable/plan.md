

## Rebranding Instituto Empuria — Plano de Implementação em 5 Fases

Este é um projeto extenso. Recomendo implementar fase por fase, validando cada uma antes de avançar.

---

### Fase 1: Design System e Identidade Visual

**Tipografia** — Substituir Inter por Unbounded (títulos) e Philosopher (corpo):
- `src/index.css`: trocar import do Google Fonts para `Unbounded:wght@400;600;700;800;900` e `Philosopher:wght@400;700`
- `tailwind.config.ts`: adicionar `fontFamily.heading: ['Unbounded', ...]` e `fontFamily.body: ['Philosopher', ...]`, manter `sans` como Philosopher
- Atualizar `body` no CSS para usar Philosopher; headings receberão `font-heading`

**Paleta de Cores** — Novas variáveis CSS baseadas no manual:
| Token | Hex | HSL aprox. |
|---|---|---|
| Vermelho (primary) | #9b2c00 | 17 100% 30% |
| Marrom (dark) | #4d1a00 | 20 100% 15% |
| Laranja (accent) | #cf4700 | 21 100% 41% |
| Amarelo (warm) | #e5a657 | 33 73% 62% |
| Off White (bg) | #ffffff / #FAFAF8 | mantém |

- Atualizar `:root` em `index.css` com novos valores para `--primary`, `--accent`, `--background`, `--foreground`, `--card`, etc.
- Atualizar tokens `--glass-*` para tons quentes (marrom/laranja em vez de azul)
- Gradientes: de `hsl(32,90%,50%)→hsl(25,95%,55%)` para `#9b2c00→#cf4700`

**Componentes** — Atualizar referências de cor hardcoded:
- `HeroSection.tsx`: textos, badges, gradientes
- `BentoEcosystem.tsx`: cores dos cards
- `LandingPage.tsx`: mesh gradient blobs
- `StickyCTADock.tsx`, `ExpertSection.tsx`, `FAQSection.tsx`
- `SubscriptionPaywall.tsx`, `CheckoutPage.tsx`: branding "Instituto Empuria" + tipografia
- `Dashboard.tsx` header: "Espanha Pass" → "Instituto Empuria"
- `FloatingDock.tsx`, `OnboardingFlow.tsx`: textos de marca

**Arquivos afetados Fase 1:**
| Arquivo | Ação |
|---|---|
| `src/index.css` | Nova paleta, fontes, tokens glass |
| `tailwind.config.ts` | fontFamily heading/body |
| `src/components/landing/HeroSection.tsx` | Rebrand texto + cores |
| `src/components/landing/BentoEcosystem.tsx` | Cores dos cards |
| `src/components/landing/ExpertSection.tsx` | Rebrand |
| `src/components/landing/StickyCTADock.tsx` | Rebrand |
| `src/components/landing/FAQSection.tsx` | Rebrand |
| `src/components/landing/SavingsCalculator.tsx` | Rebrand |
| `src/pages/LandingPage.tsx` | Mesh gradients + footer |
| `src/pages/CheckoutPage.tsx` | "Instituto Empuria" |
| `src/pages/Dashboard.tsx` | Header rebrand |
| `src/components/SubscriptionPaywall.tsx` | Rebrand |
| `src/components/OnboardingFlow.tsx` | Rebrand |
| `src/pages/AuthPage.tsx` | Rebrand |

---

### Fase 2: Módulo de Eventos e Comunidade

**Database** — Migration SQL:
```sql
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL, -- 'resenha' | 'formacao' | 'jantar'
  date timestamptz NOT NULL,
  location text,
  price_cents integer DEFAULT 0,
  currency text DEFAULT 'eur',
  max_capacity integer,
  stripe_price_id text,
  image_url text,
  recurrence text, -- 'biweekly_sunday' | null
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text DEFAULT 'confirmed', -- 'confirmed' | 'paid' | 'cancelled'
  stripe_payment_id text,
  ticket_code text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);
```
+ RLS policies para cada tabela + INSERT de dados iniciais dos 3 eventos.

**Edge Function** `create-event-checkout`:
- Recebe `event_id`, valida capacidade (count RSVPs vs max_capacity)
- Se esgotado, retorna erro
- Cria Stripe Checkout session com o `stripe_price_id` do evento
- Success URL grava RSVP com status `paid` e gera `ticket_code` (UUID curto)

**Stripe**: Criar 2 products/prices:
- Formação João Sericato: 200€ (one-time)
- Jantar de Integração: 60€ (one-time)

**Frontend** — Novo componente `src/components/EventsSection.tsx`:
- 3 cards (Resenha, Formação, Jantar)
- Resenha: botão "Confirmar Presença" → insert direto no `event_rsvps`
- Formação/Jantar: botão de checkout → edge function
- Jantar: consultar contagem de RSVPs, mostrar vagas restantes, desativar se 0

**Integração**: Adicionar tab "Eventos" no `FloatingDock` e no `Dashboard`.

**Arquivos afetados Fase 2:**
| Arquivo | Ação |
|---|---|
| Migration SQL | Tabelas events + event_rsvps |
| `supabase/functions/create-event-checkout/index.ts` | Novo |
| `src/components/EventsSection.tsx` | Novo |
| `src/components/FloatingDock.tsx` | Nova tab eventos |
| `src/pages/Dashboard.tsx` | Registar componente |

---

### Fase 3: Funil de Relocation (Lead Qualification)

**Frontend** — Novo componente `src/components/RelocationFunnel.tsx`:
- Video player (embed YouTube/Vimeo ou `<video>`) com conteúdo educacional
- Texto explicativo sobre regras de Relocation
- CTA principal: botão WhatsApp com link `https://wa.me/NUMERO?text=Olá, venho pelo Instituto Empuria e tenho interesse no Relocation. O meu ID é %23{user_id}`
- Ao clicar, registar evento na tabela `lead_clicks`

**Database** — Migration:
```sql
CREATE TABLE public.lead_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  funnel text NOT NULL, -- 'relocation' | 'consultoria'
  created_at timestamptz DEFAULT now()
);
```

**Remover** qualquer checkout/pagamento existente da página Explorar que esteja ligado a Relocation.

**Arquivos afetados Fase 3:**
| Arquivo | Ação |
|---|---|
| Migration SQL | Tabela lead_clicks |
| `src/components/RelocationFunnel.tsx` | Novo |
| `src/components/FloatingDock.tsx` | Atualizar tab explore |
| `src/pages/Dashboard.tsx` | Registar componente |

---

### Fase 4: Ecossistema do Mentor

**4A — Consultoria Individual (100€ / R$600)**

- Criar product+price no Stripe (100€ one-time + R$600 one-time)
- Nova página `src/pages/ConsultoriaPage.tsx`: landing específica com vídeo, depoimentos, CTA checkout
- Edge function `create-consultoria-checkout`: cria session Stripe, success_url aponta para dashboard
- Pós-compra: edge function (ou webhook simplificado) grava na tabela `consultoria_purchases` e gera link único de agendamento
- Dashboard mostra link de agendamento se compra existir

**4B — Clube do Imigrante (Subscription)**

- Reaproveitar a lógica existente de `check-subscription` / `create-checkout`
- Atualizar price IDs para os novos produtos "Instituto Empuria"
- RLS policies condicionais: conteúdos premium liberados apenas para subscribers ativos

**Database** — Migration:
```sql
CREATE TABLE public.consultoria_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_session_id text,
  scheduling_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

**Arquivos afetados Fase 4:**
| Arquivo | Ação |
|---|---|
| Migration SQL | Tabela consultoria_purchases |
| `src/pages/ConsultoriaPage.tsx` | Novo |
| `supabase/functions/create-consultoria-checkout/index.ts` | Novo |
| `src/App.tsx` | Nova rota /consultoria |
| `src/hooks/useSubscription.ts` | Atualizar price IDs |

---

### Fase 5: Regras de Comissionamento (Edge Functions)

**Pré-requisito**: Stripe Connect deve estar ativado na conta Stripe com "Separate Charges and Transfers".

- Atualizar `create-event-checkout` para incluir `transfer_group` na session
- Criar edge function `process-transfer` que, após pagamento confirmado:
  - Calcula split (ex: 70% plataforma, 30% parceiro)
  - Executa `stripe.transfers.create()` com `destination` (connected account ID) e `transfer_group`
- Tabela de configuração:

```sql
CREATE TABLE public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id),
  partner_stripe_account text NOT NULL,
  percentage numeric NOT NULL, -- ex: 30.00
  created_at timestamptz DEFAULT now()
);
```

- Registar cada transfer na tabela `commission_logs` para auditoria

**Arquivos afetados Fase 5:**
| Arquivo | Ação |
|---|---|
| Migration SQL | Tabelas commission_rules + commission_logs |
| `supabase/functions/process-transfer/index.ts` | Novo |
| `supabase/functions/create-event-checkout/index.ts` | Adicionar transfer_group |

---

### Ordem de execução recomendada

Fase 1 primeiro (base visual), depois Fase 2 (eventos), Fase 3 (relocation), Fase 4 (mentor), Fase 5 (comissões). Cada fase será implementada e validada antes de avançar para a próxima.

Confirme se posso iniciar pela **Fase 1**.

