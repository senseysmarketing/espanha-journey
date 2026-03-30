

## Ajustar Layout da Auditoria — Vertical → Abas com Scroll

### Problema
O layout atual usa `grid-cols-3` no desktop, criando 3 colunas muito estreitas com muito texto empilhado verticalmente. No mobile vira uma coluna infinita. A informação fica difícil de ler.

### Solução
Trocar o grid de 3 colunas por **abas horizontais** (Tabs) dentro do container centralizado (`max-w-lg mx-auto`), seguindo o padrão do sistema:

1. **3 abas**: 🟢 Seguras | 🟡 Atenção | 🔴 Ilegais — com contador em cada aba
2. **Conteúdo em lista vertical** dentro de cada aba, aproveitando toda a largura do container
3. Cards de findings ficam mais largos e legíveis
4. Funciona perfeitamente em mobile e desktop

### Alterações em `AuditDashboard.tsx`

- Importar `Tabs, TabsList, TabsTrigger, TabsContent` do shadcn/ui
- Substituir o `grid grid-cols-1 md:grid-cols-3` por um componente `Tabs` com `defaultValue` apontando para a categoria com mais itens (priorizar "illegal" se houver alertas)
- Cada `TabsTrigger` mostra ícone + nome + contador
- Cada `TabsContent` renderiza os `FindingCard`s em lista vertical com `space-y-3`
- Manter o botão "Voltar à lista" acima das abas
- O container pai já segue `max-w-lg mx-auto` do sistema

### Arquivo afetado
| Arquivo | Ação |
|---|---|
| `src/components/AuditDashboard.tsx` | Substituir grid por Tabs no detail view |

