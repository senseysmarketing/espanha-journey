

## Adicionar botão de logout no Paywall de Assinatura

### Problema
Quando um usuário novo (sem assinatura) chega ao dashboard, vê apenas o paywall sem opção de sair da conta.

### Solução
Adicionar um botão de logout discreto abaixo dos botões existentes no `SubscriptionPaywall.tsx`, usando `signOut` do `AuthContext`.

### Alteração em `src/components/SubscriptionPaywall.tsx`
- Importar `useAuth` de `@/contexts/AuthContext`
- Adicionar botão "Sair da conta" como link ghost abaixo de "Regularizar assinatura"
- Ao clicar, chamar `signOut()` e redirecionar para `/`

### Arquivo afetado
| Arquivo | Ação |
|---|---|
| `src/components/SubscriptionPaywall.tsx` | Adicionar botão de logout |

