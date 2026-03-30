

## Melhorias na Página de Autenticação

### Problema
1. Botão "Não tem conta? Crie uma" quase invisível (cor `text-muted-foreground` muito apagada no tema escuro)
2. Formulário de cadastro idêntico ao de login — causa confusão
3. "ES" no título em vez da bandeira da Espanha

### Solução

**`src/pages/AuthPage.tsx`**:

1. **Bandeira**: O emoji `🇪🇸` já está no código (linha 69), mas pode estar renderizando como "ES" dependendo da fonte. Substituir por uma imagem SVG da bandeira da Espanha (inline ou via emoji com fallback garantido).

2. **Botão toggle mais visível**: Trocar `text-muted-foreground` por `text-primary` com underline hover, para ficar claramente clicável.

3. **Formulário de cadastro diferenciado**: Quando `isSignUp === true`, exibir campos extras com animação:
   - **Nome completo** (text input)
   - **Telefone** (tel input, com placeholder +34 ou +55)
   - **Confirmar senha** (password input, com validação client-side)
   - Subtítulo diferente: "Crie sua conta para começar sua jornada na Espanha"
   - Validação: confirmar senha deve coincidir antes de submeter

4. **Dados extras no signUp**: Passar `full_name` e `phone` via `options.data` no `supabase.auth.signUp()` para que fiquem salvos nos metadados do usuário.

**Migração SQL** — Adicionar colunas `full_name` e `phone` na tabela `profiles`:
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text;
```

Atualizar o trigger de criação de perfil para copiar `full_name` e `phone` dos metadados do auth para a tabela profiles.

### Arquivos afetados
| Arquivo | Ação |
|---|---|
| `src/pages/AuthPage.tsx` | Modificar — campos extras, botão visível, bandeira |
| Migração SQL | Criar — colunas full_name e phone em profiles |

