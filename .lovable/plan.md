

## Bug Fix: Telas em branco ao sair da aba Segurança

### Causa raiz

O `SecuritySection` usa `layoutId="security-tab-active"` no Framer Motion para animar as pill tabs internas. Quando o usuário troca de aba no Floating Dock, o `AnimatePresence mode="wait"` no `Index.tsx` precisa completar a animação de saída antes de montar o novo conteúdo. O `layoutId` dentro do componente que está desmontando interfere com essa animação de saída, fazendo com que ela nunca complete — resultado: tela em branco.

### Solução

**`SecuritySection.tsx`**: Remover `layoutId="security-tab-active"` do `motion.div` das pill tabs internas e substituir por uma animação simples sem `layoutId` (ex: apenas um `motion.div` com `animate` direto, sem layout animation cross-component).

Isso elimina o conflito entre o `layoutId` interno e o `AnimatePresence mode="wait"` do pai, permitindo que as animações de saída completem normalmente.

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `src/components/SecuritySection.tsx` | Trocar `layoutId="security-tab-active"` por animação local simples (sem layoutId) |

