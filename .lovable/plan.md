

## Padronizar upload do Scanner igual ao Cofre

### Problema
O `ContractScanner` usa `glass squircle` (fundo glassmorphism sólido) na área de upload, enquanto o `DocumentVault` usa fundo transparente com apenas `border-2 border-dashed` e `rounded-3xl` — sem classe `glass`.

### Solução

**`ContractScanner.tsx`** — Alterar o `motion.label` de upload (linha 118-122):

- Remover: `glass squircle`
- Adicionar: `rounded-3xl` (igual ao Cofre)
- Adicionar botão "Selecionar arquivo" com estilo `bg-primary/10 text-primary rounded-xl` (igual ao Cofre)
- Manter o `border-2 border-dashed` que já existe

O resultado será um fundo vazado/transparente com borda tracejada, idêntico ao do Cofre.

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `src/components/ContractScanner.tsx` | Trocar `glass squircle` por `rounded-3xl`, adicionar botão "Selecionar arquivo" |

