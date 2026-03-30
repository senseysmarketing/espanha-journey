

## Problema e Diagnóstico

A edge function `analyze-document` **analisa apenas o nome do arquivo** (ex: `WhatsApp_Image_2026-03-30_at_16.38.28.jpeg`), não o conteúdo real da imagem. Como o nome não contém "passport" nem a data de vencimento, a IA chuta valores genéricos. Por isso a data de vencimento ficou errada.

### Solução: duas melhorias

### 1. Edge Function com OCR real via imagem

Alterar `analyze-document` para receber a **imagem em base64** (ou uma Signed URL do arquivo no storage) e enviá-la ao modelo multimodal (Gemini), que consegue ler o texto do passaporte diretamente da foto.

**Fluxo:**
- Frontend gera uma Signed URL do arquivo recém-uploaded
- Envia `{ fileUrl, fileName }` para a edge function
- Edge function envia a imagem como `image_url` no prompt multimodal para o Gemini
- Gemini lê o documento e extrai tipo, nome e data de vencimento real
- Fallback: se falhar, usa a lógica atual baseada em filename

**Alteração em `supabase/functions/analyze-document/index.ts`:**
- Aceitar `fileUrl` no body (Signed URL)
- Montar mensagem multimodal com `image_url` type para o Gemini processar a imagem
- Prompt instruindo a extrair dados reais do documento (nome, tipo, data de vencimento)

### 2. Botão de renomear documento

Adicionar um botão de edição (ícone Pencil) ao lado dos botões Eye e Trash no card de cada documento.

**Alteração em `src/components/DocumentVault.tsx`:**
- Adicionar estado `renamingDoc` (doc em edição) e `newName` (texto do input)
- Ao clicar no Pencil, abrir um Dialog com input de texto preenchido com o nome atual
- Ao confirmar, executar `supabase.from("documents").update({ name: newName }).eq("id", doc.id)`
- Atualizar o estado local `documents`
- Importar `Pencil` do lucide-react

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `supabase/functions/analyze-document/index.ts` | Adicionar suporte a análise multimodal de imagem via Signed URL |
| `src/components/DocumentVault.tsx` | Enviar Signed URL na chamada OCR + adicionar botão/dialog de renomear |

