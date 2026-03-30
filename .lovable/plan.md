

## Remover Confirmação de E-mail no Cadastro

### Problema
Após o cadastro, o usuário recebe a mensagem "Verifique seu e-mail para confirmar o cadastro" e precisa confirmar antes de acessar o app.

### Solução

1. **Supabase Dashboard** — Desabilitar a confirmação de e-mail:
   - Em Authentication → Providers → Email, desmarcar "Confirm email" (ou habilitar "Allow unconfirmed emails")
   - Isso faz com que o usuário seja logado automaticamente após o signUp

2. **`src/pages/AuthPage.tsx`** — Atualizar o fluxo pós-cadastro:
   - Remover a mensagem de sucesso "Verifique seu e-mail..."
   - Após signUp bem-sucedido, redirecionar direto para `/dashboard` (igual ao login)

### Arquivos afetados
| Arquivo | Ação |
|---|---|
| `src/pages/AuthPage.tsx` | Modificar — redirecionar após signUp em vez de mostrar mensagem |
| Supabase Dashboard | Configurar — desabilitar confirmação de e-mail |

### Detalhe técnico
No `AuthPage.tsx`, o bloco de signUp passará de:
```tsx
setSuccess("Verifique seu e-mail para confirmar o cadastro.");
```
Para:
```tsx
navigate("/dashboard");
```

