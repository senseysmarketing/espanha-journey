

## Corrigir modal de preview do Cofre de Documentos

### Problema
O modal usa `iframe` para exibir o documento, mas para imagens (JPEG, PNG) o iframe renderiza com fundo preto e a imagem fica desalinhada. Além disso, o `DialogContent` não tem `flex flex-col`, então o `flex-1` do container interno não funciona.

### Solução em `src/components/DocumentVault.tsx`

1. **Adicionar `flex flex-col`** ao `DialogContent` para que o layout flexbox funcione
2. **Detectar se o arquivo é imagem** (jpeg, jpg, png, webp) pela URL ou extensão do `file_url`
3. **Renderizar `<img>` para imagens** com `object-contain` centralizado, e manter `<iframe>` apenas para PDFs
4. **Ajustar o container interno** com `overflow-auto` e centralização

### Alteração

```tsx
// DialogContent: adicionar flex flex-col
<DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden flex flex-col">
  <div className="p-4 border-b border-border flex-shrink-0">
    <h3 className="font-semibold text-foreground">{previewName}</h3>
  </div>
  {previewUrl && (
    <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-auto">
      {/\.(jpe?g|png|webp|gif|bmp)/.test(previewUrl) ? (
        <img src={previewUrl} alt={previewName} className="max-w-full max-h-full object-contain rounded-lg" />
      ) : (
        <iframe src={previewUrl} className="w-full h-full border-0" title={previewName} />
      )}
    </div>
  )}
</DialogContent>
```

### Arquivo afetado
| Arquivo | Ação |
|---|---|
| `src/components/DocumentVault.tsx` | Corrigir layout do modal de preview e usar `<img>` para imagens |

