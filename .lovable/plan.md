

## Remover Concierge e unificar no Mentor

### Resumo
Remover a aba "Concierge" da seção Explorar e expandir o prompt do Mentor para também cobrir recomendações de cidades/destino, eliminando redundância.

### Alterações

**1. `src/components/ExploreSection.tsx`**
- Remover a aba `concierge` do array `tabs`
- Remover import do `ExploreConcierge`
- Remover entrada `concierge` do `tabContent`
- Manter `mapa` como tab default (já é)

**2. `supabase/functions/mentor-chat/index.ts`**
- Expandir o `SYSTEM_PROMPT` para incluir o conhecimento de concierge de destinos:
  - Recomendação de cidades (Madrid, Barcelona, Valencia, Málaga, Sevilla, Bilbao, Alicante, Granada, Zaragoza)
  - Custo de vida, comunidade brasileira, clima, segurança
  - Perfis (Trabalho Remoto, Família, Estudante)
  - Orçamento mensal
- Deploy da edge function atualizada

**3. `src/components/MentorChat.tsx`**
- Adicionar quick actions de destino junto aos existentes: "Cidades para morar", "Custo de vida"
- Atualizar placeholder do input para algo mais abrangente: "Pergunte sobre burocracia ou cidades..."

**4. Limpeza (opcional)**
- `src/components/ExploreConcierge.tsx` pode ser removido (não mais referenciado)
- `supabase/functions/city-concierge/index.ts` pode ser removido futuramente

### Arquivos afetados
| Arquivo | Ação |
|---|---|
| `src/components/ExploreSection.tsx` | Modificar — remover aba Concierge |
| `supabase/functions/mentor-chat/index.ts` | Modificar — expandir prompt com conhecimento de destinos |
| `src/components/MentorChat.tsx` | Modificar — adicionar quick actions de destino |
| `src/components/ExploreConcierge.tsx` | Remover |

