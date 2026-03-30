

## Cofre de Documentos Funcional — Plano de Implementação

### Resumo
Tornar o módulo Document Vault funcional com Supabase Storage + Database, preview via Signed URL, delete com confirmação, e edge function para simular OCR.

### 1. Migration SQL

**Criar bucket `vault`** (privado, arquivos por user_id):
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('vault', 'vault', false);
```

**RLS para bucket `vault`:**
- SELECT/INSERT/UPDATE/DELETE: `auth.uid()::text = (storage.foldername(name))[1]` (arquivos organizados em `{user_id}/filename`)

**Nota:** Já existe a tabela `documents` com colunas `id, user_id, name, type, expiry_date, status, file_url, created_at` — vamos reutilizá-la. As RLS policies já existem (CRUD por user_id). Não precisa criar nova tabela.

### 2. Edge Function `analyze-document`

Cria `supabase/functions/analyze-document/index.ts`:
- Recebe `{ fileName: string }` via POST
- Usa LOVABLE_API_KEY + Lovable AI gateway para simular OCR/extração
- Extrai tipo do documento (passport, TIE, NIE, etc.) e data de vencimento estimada
- Retorna `{ type, name, expiry_date }` 
- Adicionar `[functions.analyze-document] verify_jwt = false` ao `config.toml`

### 3. Rewrite `DocumentVault.tsx`

**Lógica completa:**
- Fetch documentos do Supabase `documents` table filtrado por `user_id`
- Upload: envia arquivo ao bucket `vault/{user_id}/{uuid}_{filename}`, chama edge function `analyze-document` para extrair metadata, insere registro na tabela `documents`
- Status calculado em tempo real: `expiry_date` vs `now()` → valid (>90d), expiring (≤90d), expired (<0d)
- Botão Eye: abre Dialog fullscreen com Signed URL do Supabase Storage (60s TTL)
- Botão Delete (Trash2): AlertDialog de confirmação → deleta registro + arquivo do storage
- Haptic feedback (`navigator.vibrate`) no upload bem-sucedido
- AnimatePresence + layoutId para animação de cards surgindo do dropzone
- Loading state com Loader2 spinner
- Empty state quando sem documentos

**Padrão visual:** Cards `glass squircle-sm`, badges circulares coloridos, consistente com AuditDashboard

### 4. Alterações no `index.css`

Nenhuma — já tem os estilos glass/squircle necessários.

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar bucket `vault` + RLS storage policies |
| `supabase/functions/analyze-document/index.ts` | Criar edge function OCR simulado |
| `supabase/config.toml` | Adicionar `[functions.analyze-document]` |
| `src/components/DocumentVault.tsx` | Reescrever completamente |

