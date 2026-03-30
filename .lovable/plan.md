

## Autenticação + Pagamento Stripe — Espanha Pass

### Resumo
Implementar login/cadastro com Supabase Auth, integração Stripe para pagamento unico com seleção de moeda (BRL/EUR), paywall no dashboard, e webhook para processar eventos Stripe.

---

### Passo 0: Habilitar Stripe

Usar a ferramenta `stripe--enable_stripe` para configurar o Stripe no projeto. Isso vai solicitar a secret key e expor as ferramentas de criação de produtos/precos.

### Passo 1: Migração de Banco de Dados

Adicionar colunas na tabela `profiles`:
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';
```

Criar tabela `subscriptions`:
```sql
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text DEFAULT 'inactive',
  currency text DEFAULT 'eur',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

### Passo 2: Página de Auth — `src/pages/AuthPage.tsx`

- Página `/auth` com formulário de login/cadastro (email + senha)
- Estética Liquid Glass: inputs com `landing-glass`, bordas Squircle, mesh gradient de fundo
- Toggle entre "Entrar" e "Criar conta"
- Usa `supabase.auth.signInWithPassword` e `supabase.auth.signUp`
- Após login, redireciona para `/dashboard`
- Após cadastro, redireciona para `/checkout` (seleção de moeda + pagamento)

### Passo 3: Página de Checkout — `src/pages/CheckoutPage.tsx`

- Segmented Control iOS-style para escolher BRL (R$ 59,90) ou EUR (€ 9,90)
- Botão "Pagar" que invoca a edge function `create-checkout` com a moeda selecionada
- Estética Apple 2025 com glass cards e mesh gradient

### Passo 4: Edge Function `create-checkout`

- Recebe `{ currency: 'brl' | 'eur' }` e o JWT do usuario
- Cria ou recupera `stripe_customer_id` no Stripe
- Cria uma Checkout Session com o price_id correto (preço fixo BRL ou EUR)
- Retorna a `url` da sessão para redirect

### Passo 5: Edge Function `stripe-webhook`

- Processa eventos `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
- Atualiza `subscriptions` e `profiles.subscription_status` no Supabase via service role
- Sem verificação JWT (webhook público), mas valida assinatura Stripe

### Passo 6: Paywall no Dashboard — `src/pages/Dashboard.tsx`

- Hook `useSubscription` que busca `profiles.subscription_status`
- Se status !== 'active', renderiza overlay com `backdrop-blur-2xl` sobre o dashboard
- Overlay contém botão "Regularizar Assinatura" que invoca edge function para criar portal session Stripe
- Se pagamento falhar: alerta visual coral + `navigator.vibrate(200)`

### Passo 7: Proteção de Rotas — `src/App.tsx`

- Criar `AuthProvider` com contexto de sessão via `onAuthStateChange`
- Componente `ProtectedRoute` que redireciona para `/auth` se não autenticado
- Rotas:
  - `/` → LandingPage (pública)
  - `/auth` → AuthPage (pública)
  - `/checkout` → CheckoutPage (autenticado)
  - `/dashboard` → Dashboard (autenticado, com paywall)

### Arquivos afetados

| Arquivo | Acao |
|---|---|
| `src/pages/AuthPage.tsx` | Criar |
| `src/pages/CheckoutPage.tsx` | Criar |
| `src/contexts/AuthContext.tsx` | Criar |
| `src/components/ProtectedRoute.tsx` | Criar |
| `src/components/SubscriptionPaywall.tsx` | Criar |
| `src/hooks/useSubscription.ts` | Criar |
| `src/pages/Dashboard.tsx` | Modificar — adicionar paywall |
| `src/App.tsx` | Modificar — novas rotas + AuthProvider |
| `supabase/functions/create-checkout/index.ts` | Criar |
| `supabase/functions/stripe-webhook/index.ts` | Criar |
| `supabase/config.toml` | Modificar — adicionar funções |
| Migração SQL | Criar — subscriptions table + profiles columns |

