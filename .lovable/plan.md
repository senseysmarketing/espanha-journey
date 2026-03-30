

## Refinar Edge Function analyze-contract — Especialista LAU 2025/2026

### O que muda

**1. Edge Function (`supabase/functions/analyze-contract/index.ts`)**

- **System prompt completo**: Substituir o prompt atual por um detalhado com Chain of Thought, cobrindo as 6 verificações obrigatórias (Reparos Art. 21, Duração Art. 9/10, Acesso Art. 18 CE, Honorários Ley 12/2023, Garantias Art. 36.5, Restrições de uso)
- **Modelo com reasoning**: Usar `google/gemini-3-flash-preview` com `reasoning: { effort: "high" }` para análise semântica profunda
- **Schema de saída enriquecido**: Cada item agora retorna 5 campos: `title`, `status` (safe/attention/illegal), `extracted_text` (trecho real do contrato), `legal_analysis` (explicação com artigo da lei), `recommendation` (o que dizer ao proprietário)
- **Estrutura unificada**: Em vez de 3 arrays separados (`safe_clauses`, `attention_points`, `illegal_alerts`), retornar um único array `findings` onde cada item tem seu `status` — mas manter compatibilidade no retorno convertendo para o formato antigo

**2. AuditDashboard (`src/components/AuditDashboard.tsx`)**

- Atualizar a interface `Finding` para incluir os novos campos: `extracted_text`, `legal_analysis`, `recommendation`
- Exibir `extracted_text` como citação (bloco quote estilizado)
- Exibir `legal_analysis` no lugar do `description` atual
- Exibir `recommendation` como dica actionable ao final de cada card
- Manter retrocompatibilidade com auditorias antigas que só têm `title` + `description`

### Prompt da IA (resumo)

```
Você é um Especialista em Direito Imobiliário Espanhol (LAU 2025/2026).

Metodologia (Chain of Thought):
1. EXTRAIA o trecho exato do contrato
2. CONFRONTE com LAU e Ley 12/2023
3. CLASSIFIQUE rigorosamente

Verificações obrigatórias:
- Reparos (Art. 21 LAU): transferir habitabilidade ao inquilino = ILEGAL
- Duração (Art. 9/10): contratos < 5 anos em vivienda habitual = ILEGAL  
- Acesso (Art. 18 CE): proprietário com chave/acesso livre = ILEGAL
- Honorários (Ley 12/2023): cobrar comissão do inquilino = ILEGAL
- Garantias (Art. 36.5): fianza + garantias > 3 meses = ILEGAL
- Restrições de uso: proibir visitas = ATENÇÃO
```

### Schema da tool call

```json
{
  "findings": [{
    "title": "string",
    "status": "safe | attention | illegal",
    "extracted_text": "trecho real do contrato",
    "legal_analysis": "explicação com artigo da lei",
    "recommendation": "o que dizer ao proprietário"
  }]
}
```

A edge function converte o array `findings` para o formato `{ safe_clauses, attention_points, illegal_alerts }` antes de retornar, mantendo compatibilidade com o frontend existente e auditorias já salvas.

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `supabase/functions/analyze-contract/index.ts` | Prompt + schema + reasoning + conversão |
| `src/components/AuditDashboard.tsx` | Exibir extracted_text, legal_analysis, recommendation |

