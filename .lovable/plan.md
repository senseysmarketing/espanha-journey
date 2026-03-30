

## Campo de Telefone com Máscara e Seletor de País

### Solução
Criar um componente `PhoneInput` customizado com:

1. **Dropdown de país** — Select estilizado com bandeira emoji + código DDI, países mais relevantes no topo (Brasil 🇧🇷 +55, Espanha 🇪🇸 +34, Portugal 🇵🇹 +351, etc.) seguidos de uma lista completa dos principais países.

2. **Máscara de telefone** — Formatação automática do número conforme o país selecionado:
   - Brasil: `(11) 99999-9999`
   - Espanha: `612 345 678`
   - Portugal: `912 345 678`
   - Padrão genérico para outros países

3. **Integração** — O valor salvo no estado `phone` será o número completo com DDI (ex: `+5516994213312`), sem formatação, para armazenamento limpo no banco.

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/components/PhoneInput.tsx` | Criar — componente com dropdown de país + máscara |
| `src/pages/AuthPage.tsx` | Modificar — substituir input de telefone pelo novo `PhoneInput` |

### Detalhes técnicos
- Sem dependências externas — máscara implementada com lógica pura (regex replace no onChange)
- Dropdown usando o mesmo estilo `inputClass` do formulário existente, com layout flex para alinhar select + input
- Lista de ~15 países mais comuns para o público-alvo (LATAM + Europa)

