

## Padronizar cores do Mentor para tom cinza

Trocar todas as ocorrências de `glass-aurora` por `glass` no `MentorChat.tsx`, alinhando visualmente com as demais telas.

### Alterações

**`src/components/MentorChat.tsx`**:
- Linha 160: quick action buttons — `glass-aurora` → `glass`
- Linha 181: mensagens do assistente — `glass-aurora` → `glass`
- Linha 210: indicador de "pensando" — `glass-aurora` → `glass`
- Linha 187: cor do label "Mentor" — `text-accent` → `text-primary` (para manter destaque sutil no tom laranja/dourado da paleta)

Nenhum outro arquivo precisa ser alterado.

