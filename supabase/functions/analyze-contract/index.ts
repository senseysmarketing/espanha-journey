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

    const systemPrompt = `Você é um especialista em direito imobiliário espanhol, especialmente na LAU (Ley de Arrendamientos Urbanos) e proteção ao inquilino estrangeiro. Analise o contrato de aluguel fornecido e classifique cada cláusula relevante.

Regras importantes da LAU para detectar ilegalidades:
- A taxa da imobiliária (honorarios) deve ser paga pelo proprietário, não pelo inquilino
- A fianza (caução) não pode exceder 1 mês de aluguel para moradia habitual  
- Garantias adicionais não podem exceder 2 meses de aluguel
- O contrato mínimo é de 5 anos (7 se o proprietário for pessoa jurídica)
- O inquilino pode desistir após 6 meses com aviso prévio de 30 dias
- Aumentos de aluguel só podem seguir o índice oficial (INE)
- Cláusulas que renunciam aos direitos do inquilino são nulas

Use a ferramenta para retornar a análise estruturada.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analise este contrato de aluguel espanhol:\n\n${text.slice(0, 15000)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_analysis",
              description: "Retorna a análise estruturada do contrato",
              parameters: {
                type: "object",
                properties: {
                  safe_clauses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        law_reference: { type: "string" },
                      },
                      required: ["title", "description"],
                    },
                  },
                  attention_points: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        law_reference: { type: "string" },
                      },
                      required: ["title", "description"],
                    },
                  },
                  illegal_alerts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        law_reference: { type: "string" },
                      },
                      required: ["title", "description"],
                    },
                  },
                },
                required: ["safe_clauses", "attention_points", "illegal_alerts"],
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

    const findings = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(findings), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-contract error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
