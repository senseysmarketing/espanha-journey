

## Salvar e Listar Auditorias de Contratos

### Fluxo desejado
1. Usuário envia contrato no Scanner → IA analisa → resultado aparece automaticamente
2. O resultado é salvo no banco (`contracts_audit`) com nome do arquivo e findings
3. Na aba "Auditoria", mostra uma lista dos contratos já analisados
4. Ao clicar em um contrato da lista, exibe o dashboard de auditoria daquele contrato

### Alterações

**1. `src/components/ContractScanner.tsx`**
- Passar o `fileName` junto com os findings no callback `onAnalysisComplete`
- Callback muda para `onAnalysisComplete({ fileName, findings })`

**2. `src/components/SecuritySection.tsx`**
- Após receber análise completa, salvar no Supabase (`contracts_audit`) com `file_name`, `findings_json`, `status: 'completed'` e `user_id`
- Manter o fluxo atual: análise completa → mostra auditoria automaticamente

**3. `src/components/AuditDashboard.tsx` → refatorar para dois modos**
- **Modo lista**: carrega todos os registros de `contracts_audit` do usuário, exibe como cards com nome do arquivo, data e contagem de alertas
- **Modo detalhe**: ao clicar num card, exibe o dashboard atual (3 colunas) com os dados de `findings_json`
- Botão "Voltar" para retornar à lista
- Quando recebe `data` como prop (vindo direto do scanner), mostra o detalhe direto

### Detalhes técnicos
- A tabela `contracts_audit` já existe com as colunas necessárias (`file_name`, `findings_json`, `user_id`, `status`, `created_at`) e RLS configurado
- Query da lista: `supabase.from('contracts_audit').select('*').eq('user_id', user.id).order('created_at', { ascending: false })`
- Insert após análise: `supabase.from('contracts_audit').insert({ user_id, file_name, findings_json: findings, status: 'completed' })`
- Usar `useAuth()` para obter `user.id`

### Arquivos afetados
| Arquivo | Ação |
|---|---|
| `src/components/ContractScanner.tsx` | Incluir fileName no callback |
| `src/components/SecuritySection.tsx` | Salvar auditoria no Supabase após análise |
| `src/components/AuditDashboard.tsx` | Adicionar modo lista + modo detalhe |

