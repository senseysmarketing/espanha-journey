import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    if (!fileName) {
      return new Response(JSON.stringify({ error: "fileName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Analyze this document filename and determine:
1. The document type (one of: passport, tie, nie, empadronamiento, contrato_trabajo, other)
2. A human-readable name in Portuguese
3. An estimated expiry date (ISO format YYYY-MM-DD)

Filename: "${fileName}"

Based on the filename, infer the document type. For expiry dates:
- Passports: typically valid 10 years from now
- TIE: typically valid 2 years from now  
- NIE: typically valid 5 years from now
- Empadronamiento: valid 3 months from now
- Work contracts: valid 1 year from now
- Other: valid 1 year from now`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a document analysis assistant. Return ONLY valid JSON with no markdown formatting.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_document_info",
              description: "Extract document metadata from filename",
              parameters: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["passport", "tie", "nie", "empadronamiento", "contrato_trabajo", "other"],
                  },
                  name: { type: "string", description: "Human-readable name in Portuguese" },
                  expiry_date: { type: "string", description: "ISO date YYYY-MM-DD" },
                },
                required: ["type", "name", "expiry_date"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_document_info" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      // Fallback: return sensible defaults
      const now = new Date();
      const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      return new Response(
        JSON.stringify({
          type: "other",
          name: fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          expiry_date: oneYearLater.toISOString().split("T")[0],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    const now = new Date();
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    return new Response(
      JSON.stringify({
        type: "other",
        name: fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        expiry_date: oneYearLater.toISOString().split("T")[0],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-document error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
