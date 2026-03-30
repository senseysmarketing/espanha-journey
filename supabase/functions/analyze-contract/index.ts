import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Texto do contrato muito curto ou inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um Especialista em Direito Imobiliário Espanhol, com profundo conhecimento da LAU (Ley de Arrendamientos Urbanos) atualizada até 2025/2026 e da Ley 12/2023 de Vivienda.

## Metodologia (Chain of Thought)

Para CADA cláusula relevante do contrato, siga rigorosamente estes passos:

1. **EXTRAIA**: Transcreva o trecho EXATO do contrato que está sendo analisado. Copie palavra por palavra.
2. **CONFRONTE**: Compare o trecho com a legislação aplicável (LAU, Ley 12/2023 de Vivienda, Código Civil, Constituição Espanhola).
3. **CLASSIFIQUE**: 
   - "illegal" → Se contradiz um direito irrenunciável do inquilino ou viola lei imperativa
   - "attention" → Se é abusivo, desproporcional ou limita direitos de forma questionável
   - "safe" → Se está em conformidade com a lei

## Verificações Obrigatórias

Você DEVE verificar TODAS as seguintes áreas, mesmo que o contrato não as mencione explicitamente (a ausência de certas cláusulas também pode ser relevante):

### 1. Reparos e Obras (Art. 21 LAU)
- **Busque**: Cláusulas como "el inquilino se hará cargo de todas las reparaciones", "el arrendatario asumirá los gastos de mantenimiento" ou menção a reparos estruturais (telhados, canos, fachadas, instalações elétricas/hidráulicas).
- **Regra**: É ILEGAL transferir ao inquilino custos de conservação e habitabilidade. O inquilino só é responsável por pequenos reparos de desgaste pelo uso ordinário (Art. 21.4 LAU). Reparos necessários para manter a habitabilidade são obrigação do proprietário.

### 2. Duração e Prórrogas (Art. 9 e 10 LAU)
- **Busque**: Contratos de 11 meses ou duração inferior a 1 ano que aparentam ser para moradia habitual, renúncia expressa a prórrogas, cláusulas de término antecipado sem causa.
- **Regra**: Se o uso é "vivienda habitual", o inquilino tem direito a prorrogação até completar 5 anos (proprietário pessoa física) ou 7 anos (pessoa jurídica), independentemente do que diga o contrato. Qualquer cláusula de renúncia a esse direito é NULA e ILEGAL. Contratos de 11 meses para moradia habitual são fraude à lei.

### 3. Direito de Acesso e Inviolabilidade do Domicílio (Art. 18 Constituição Espanhola)
- **Busque**: "El arrendador podrá entrar en la vivienda para inspeccionar", "el dueño conserva una llave", "visitas periódicas de inspección", "acceso para comprobación del estado".
- **Regra**: O domicílio é INVIOLÁVEL (Art. 18.2 CE). O proprietário NÃO pode entrar, reter chaves ou inspecionar sem autorização expressa do inquilino em cada ocasião ou ordem judicial. Qualquer cláusula que conceda acesso livre é ILEGAL.

### 4. Honorários da Agência (Ley 12/2023 de Vivienda)
- **Busque**: "Honorarios de gestión", "gastos de intermediación", "comisión de la agencia a cargo del arrendatario", "gastos de formalización".
- **Regra**: Em aluguéis de moradia habitual, a comissão da imobiliária DEVE ser paga exclusivamente pelo proprietário. Cobrar do inquilino é ILEGAL segundo a Ley 12/2023.

### 5. Garantias Financeiras (Art. 36 LAU)
- **Busque**: Valores de fianza, depósitos, garantias adicionais, avales bancários, seguros de caução.
- **Regra**: Fianza legal = 1 mês de aluguel (Art. 36.1). Garantias adicionais não podem exceder 2 meses de aluguel em moradia habitual (Art. 36.5). Total máximo = 3 meses. Qualquer valor superior é ILEGAL.

### 6. Restrições de Uso e Convivência
- **Busque**: Proibições de visitas, restrições a convívio familiar, limitações de horários para uso de áreas comuns, proibição de ter animais sem base legal.
- **Regra**: Proibir visitas sociais ou convívio familiar fere a liberdade pessoal e o uso pacífico do imóvel. Classificar como ATENÇÃO.

### 7. Atualizações de Aluguel (Art. 18 LAU)
- **Busque**: Cláusulas de aumento anual, referência a IPC, índices de atualização, aumentos fixos percentuais.
- **Regra**: Aumentos só podem seguir o índice oficial (INE/IRAV). Aumentos fixos arbitrários ou acima do índice oficial são ATENÇÃO ou ILEGAL.

### 8. Penalizações e Cláusulas Penais
- **Busque**: Multas por rescisão antecipada, penalizações desproporcionais, perda de fianza como penalidade.
- **Regra**: O inquilino pode desistir após 6 meses com aviso prévio de 30 dias (Art. 11 LAU). Penalizações desproporcionais são ATENÇÃO. Cláusulas que renunciam a direitos do inquilino são NULAS.

## Idioma
Responda sempre em PORTUGUÊS DO BRASIL. Os trechos extraídos do contrato devem ser mantidos no idioma original (espanhol).

Use a ferramenta para retornar a análise estruturada.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        reasoning: { effort: "high" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analise este contrato de aluguel espanhol em profundidade. Verifique TODAS as 8 áreas obrigatórias:\n\n${text.slice(0, 15000)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_analysis",
              description: "Retorna a análise jurídica estruturada do contrato",
              parameters: {
                type: "object",
                properties: {
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Nome curto da cláusula analisada" },
                        status: { type: "string", enum: ["safe", "attention", "illegal"], description: "Classificação da cláusula" },
                        extracted_text: { type: "string", description: "Trecho EXATO copiado do contrato (em espanhol)" },
                        legal_analysis: { type: "string", description: "Explicação em português citando o Artigo da Lei aplicável" },
                        recommendation: { type: "string", description: "O que o inquilino deve dizer ou fazer para negociar" },
                      },
                      required: ["title", "status", "extracted_text", "legal_analysis", "recommendation"],
                    },
                  },
                },
                required: ["findings"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro na análise do contrato." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "IA não retornou análise estruturada." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { findings } = JSON.parse(toolCall.function.arguments);

    // Convert unified findings to legacy format for backward compatibility
    const safe_clauses = findings
      .filter((f: any) => f.status === "safe")
      .map((f: any) => ({
        title: f.title,
        description: f.legal_analysis || f.description,
        law_reference: undefined,
        extracted_text: f.extracted_text,
        legal_analysis: f.legal_analysis,
        recommendation: f.recommendation,
      }));

    const attention_points = findings
      .filter((f: any) => f.status === "attention")
      .map((f: any) => ({
        title: f.title,
        description: f.legal_analysis || f.description,
        law_reference: undefined,
        extracted_text: f.extracted_text,
        legal_analysis: f.legal_analysis,
        recommendation: f.recommendation,
      }));

    const illegal_alerts = findings
      .filter((f: any) => f.status === "illegal")
      .map((f: any) => ({
        title: f.title,
        description: f.legal_analysis || f.description,
        law_reference: undefined,
        extracted_text: f.extracted_text,
        legal_analysis: f.legal_analysis,
        recommendation: f.recommendation,
      }));

    return new Response(JSON.stringify({ safe_clauses, attention_points, illegal_alerts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-contract error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
