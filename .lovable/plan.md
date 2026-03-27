

## Centralizar a Seção de Segurança (igual ao Cofre)

### Problema

A `SecuritySection` usa `px-6` com largura total, sem centralização. O `DocumentVault` usa `max-w-lg mx-auto px-4 py-8 pb-32` para centralizar o conteúdo.

### Solução

Aplicar o mesmo padrão de layout do `DocumentVault` à `SecuritySection`:

**`SecuritySection.tsx`:**
- Trocar o wrapper de `<div className="pb-28 space-y-6">` para `<div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">`
- Centralizar o header (adicionar `text-center`)
- Centralizar as pill tabs (adicionar `flex justify-center`)
- Remover os `px-6` internos (o padding já vem do wrapper)

**`ContractScanner.tsx`:**
- Remover paddings laterais próprios que conflitem com o layout centralizado do pai

Isso garante que a seção de Segurança tenha a mesma largura máxima, centralização e espaçamento do Cofre de Documentos.

