

## Remover efeito de foco/overlay na auditoria

### Problema
Quando a auditoria tem cláusulas ilegais, um overlay (`backdrop-blur`) é ativado (`alertFocused`). Ao clicar fora, o overlay some mas a tela "recarrega" mostrando o botão "Voltar à lista" — experiência confusa e desnecessária.

### Solução
Remover completamente a lógica de `alertFocused` do `AuditDashboard.tsx`:
- Remover o estado `alertFocused`
- Remover o `useEffect` que seta `alertFocused` (linhas 65-77) — manter apenas o toast e vibração
- Remover o bloco `AnimatePresence` com o overlay backdrop-blur
- Remover a classe condicional `relative z-40` do grid
- Remover `setAlertFocused(false)` do botão "Voltar"

### Arquivo afetado
`src/components/AuditDashboard.tsx`

