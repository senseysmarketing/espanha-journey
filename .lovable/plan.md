

# Fase 5 — Implementacao com Refinamentos de Seguranca

## Resumo dos refinamentos incorporados

1. **Check de Estoque**: `create-event-checkout` ja valida capacidade (linhas 43-56), mas o RSVP e gravado como "paid" antes do pagamento ser confirmado. Corrigir para status "pending" no checkout, e so mudar para "paid" no webhook.
2. **Transfer Group**: Adicionar `transfer_group` a todas as sessoes de checkout para vincular cobranca a transferencia (essencial para estornos).
3. **Arredondamento de Moeda**: Usar `Math.round(amount * 0.85)` em todos os calculos de split para evitar decimais.
4. **Protecao da Agenda**: O `scheduling_url` so sera gravado apos confirmacao do webhook (nao no momento do checkout). O RLS ja garante que so o proprio usuario ve seus registros em `consultoria_purchases`.

---

## Fase 1: Migration + Edge Function de Onboarding

### 1.1 Migration SQL — Tabela `connected_accounts`

```sql
CREATE TABLE public.connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_account_id text NOT NULL UNIQUE,
  onboarding_complete boolean DEFAULT false,
  account_type text DEFAULT 'express',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected account"
  ON public.connected_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected account"
  ON public.connected_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected account"
  ON public.connected_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 1.2 Edge Function `onboard-mentor`

Nova funcao em `supabase/functions/onboard-mentor/index.ts`:
- Recebe `user_id` do usuario autenticado
- Cria conta Express via `stripe.accounts.create({ type: 'express' })`
- Insere registro na tabela `connected_accounts`
- Gera link de onboarding via `stripe.accountLinks.create()` com `return_url` e `refresh_url` apontando para o dashboard
- Retorna a URL de onboarding

### 1.3 Correcoes nas funcoes existentes (refinamentos de seguranca)

**`create-event-checkout`** — Alteracoes:
- Mudar o status do RSVP de "paid" para "pending" (pagamento ainda nao confirmado)
- Adicionar `transfer_group: \`evt_${event_id}_${crypto.randomUUID().slice(0,8)}\`` na sessao
- Buscar `connected_accounts` do organizador do evento (requer coluna `organizer_user_id` na tabela `events` — adicionar na migration)
- Calcular transfer: `Math.round(event.price_cents * 0.85)`
- Adicionar `payment_intent_data.transfer_data` com destination e amount

**`create-consultoria-checkout`** — Alteracoes:
- Mudar status inicial do insert para "pending" (nao "paid")
- Remover geracao do `scheduling_url` (sera feito pelo webhook)
- Adicionar `transfer_group` na sessao
- Adicionar `payment_intent_data.transfer_data` com destination do mentor e `Math.round(amount * 0.85)`

### 1.4 Migration adicional — Coluna `organizer_user_id` em `events`

```sql
ALTER TABLE public.events 
  ADD COLUMN organizer_user_id uuid;
```

Necessaria para vincular eventos a connected accounts dos organizadores.

---

## Arquivos afetados

| Arquivo | Acao |
|---|---|
| Migration SQL | Tabela `connected_accounts` + coluna `organizer_user_id` em events |
| `supabase/functions/onboard-mentor/index.ts` | Novo |
| `supabase/functions/create-event-checkout/index.ts` | Atualizar com transfer_data, transfer_group, status pending |
| `supabase/functions/create-consultoria-checkout/index.ts` | Atualizar com transfer_data, transfer_group, remover scheduling_url |

## Prerequisito

Antes de implementar o `transfer_data`, preciso saber: voce ja tem um `stripe_account_id` de teste (connected account) para usar no desenvolvimento? Caso contrario, a funcao `onboard-mentor` sera usada para criar um.

