

## Ajustar cor do texto no Paywall

O parágrafo na linha 37 usa `text-muted-foreground` que fica muito apagado no tema escuro. Trocar para `text-foreground/70` para manter legibilidade, consistente com o padrão usado nos outros textos secundários do app.

### Alteração
**`src/components/SubscriptionPaywall.tsx`** — linha 37:
- De: `className="text-muted-foreground text-sm"`
- Para: `className="text-foreground/70 text-sm"`

