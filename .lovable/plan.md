

## Persistir Perfil e Progresso do Usuário

### Problema
O perfil selecionado no onboarding (nômade, arraigo, nacionalidade) e o progresso dos checklists são perdidos ao recarregar a página — tudo é armazenado apenas em estado local.

### Solução

**1. Salvar `selected_profile` no Supabase ao completar onboarding**
- A tabela `profiles` já possui a coluna `selected_profile` — basta usá-la
- No `Dashboard.tsx`, ao montar, buscar o perfil do usuário via `supabase.from('profiles').select('selected_profile')`
- Se `selected_profile` já existe, pular o onboarding automaticamente
- No `handleOnboardingComplete`, fazer `update` na tabela `profiles` com o valor selecionado

**2. Persistir checklist da JourneyMap no Supabase**
- Usar a tabela `journey_milestones` existente para salvar o status de cada milestone e itens marcados
- No `JourneyMap.tsx`, carregar milestones do usuário ao montar e salvar alterações de checklist via upsert

**3. Botão "Trocar Caminho" no ProfileView**
- Adicionar um item de menu "Trocar Caminho" na tela de perfil com ícone de troca
- Ao clicar, abre um dialog/modal com as 3 opções de perfil (reutilizando o layout do onboarding)
- Ao confirmar, faz update no `profiles.selected_profile` e recarrega os dados relevantes

**4. Dashboard carrega perfil do Supabase**
- `Dashboard.tsx` usa `useAuth()` para pegar o `user.id`
- Faz query ao `profiles` na montagem
- Se `selected_profile` não é null → seta `onboarded = true` direto
- Se é null → mostra o OnboardingFlow

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/pages/Dashboard.tsx` | Buscar perfil do Supabase, condicionar onboarding |
| `src/components/OnboardingFlow.tsx` | Salvar `selected_profile` no Supabase ao completar |
| `src/components/JourneyMap.tsx` | Carregar/salvar checklist items via `journey_milestones` |
| `src/components/ProfileView.tsx` | Adicionar botão "Trocar Caminho" com dialog de seleção |

### Detalhes técnicos
- Usar `useAuth()` do `AuthContext` para obter `user.id`
- Query: `supabase.from('profiles').select('selected_profile').eq('user_id', user.id).single()`
- Update: `supabase.from('profiles').update({ selected_profile }).eq('user_id', user.id)`
- Checklist persistence: upsert em `journey_milestones` com `milestone_name` e `status` por `user_id`
- Dialog de troca usa `Dialog` do shadcn/ui com as mesmas 3 opções visuais do onboarding

