

## Ajustes na Página de Checkout

### Alterações em `src/pages/CheckoutPage.tsx`:

1. **Bandeira da Espanha** — Substituir o emoji `🇪🇸` no título por uma imagem SVG inline da bandeira (mesmo padrão usado no `AuthPage.tsx`), garantindo renderização consistente em todos os navegadores.

2. **Botão de voltar** — Adicionar um botão com ícone de seta (←) no topo esquerdo da página, usando `useNavigate` com `navigate(-1)` para voltar à página anterior. Estilo discreto com `text-foreground/70` e hover sutil.

### Detalhes técnicos
- Importar `useNavigate` de `react-router-dom` e `ArrowLeft` de `lucide-react`
- Botão de voltar posicionado acima do card, alinhado à esquerda dentro do container `max-w-md`
- Bandeira como SVG inline `<svg>` com as cores da Espanha (vermelho/amarelo), ~28px, mesmo componente usado no AuthPage

