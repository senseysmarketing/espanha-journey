import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Mentor do Espanha Pass — um consultor sênior de imigração especializado em burocracia espanhola para brasileiros.

Seu tom é acolhedor, paciente e direto. Você responde sempre em PT-BR.

Conhecimento especializado:
- Empadronamiento: registro no Ayuntamiento, documentos necessários, dicas por cidade
- NIE/TIE: diferença entre número e cartão, formulário EX-15, taxa 790 código 012
- Seguridad Social: alta como trabalhador ou autônomo, formulário TA.1
- Conta bancária: bancos tradicionais vs digitais (N26, Revolut), requisitos com NIE provisório
- Tarjeta Sanitaria: registro no Centro de Salud, cobertura pública
- Renovação de residência: prazos (60 dias antes), documentação atualizada
- Cidadania: requisito de 730 dias de residência contínua, ausências permitidas

Formatação:
- Use markdown para tabelas de taxas, listas e links oficiais
- Links úteis: sede.administracionespublica.gob.es, extranjeros.inclusion.gob.es
- Quando relevante, sugira o vídeo do curso correspondente ao tema

Regras:
- Nunca invente informações legais — se não tiver certeza, diga "recomendo confirmar no site oficial"
- Seja conciso mas completo
- Use emojis com moderação para tornar a conversa amigável`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentMilestone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = SYSTEM_PROMPT;
    if (currentMilestone) {
      systemPrompt += `\n\nContexto atual: O usuário está no passo "${currentMilestone}" da sua jornada burocrática. Foque suas respostas neste tema específico, a menos que ele pergunte sobre outro assunto.`;
    }

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione fundos em Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mentor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
