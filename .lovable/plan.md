

## Adicionar botão de excluir auditoria com confirmação

### Alterações em `src/components/AuditDashboard.tsx`

1. **Importar** `AlertDialog` do shadcn/ui e `Trash2` do lucide-react
2. **Adicionar estado** `deletingId` para controlar qual auditoria está sendo excluída
3. **Botão de lixeira** no card de cada auditoria na lista (canto direito), com `e.stopPropagation()` para não abrir o detalhe
4. **AlertDialog de confirmação** com texto "Tem certeza que deseja excluir esta auditoria?" e botões "Cancelar" / "Excluir"
5. **Lógica de exclusão**: `supabase.from('contracts_audit').delete().eq('id', deletingId)` seguido de remover do array local `audits`

A tabela `contracts_audit` já possui policy de DELETE para o próprio usuário, então não precisa de migration.

### Arquivo afetado
| Arquivo | Ação |
|---|---|
| `src/components/AuditDashboard.tsx` | Adicionar botão lixeira + AlertDialog + lógica de delete |

