import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_EUR = "price_1TK1YKFjQUFfbIeCethkQfcL";
const PRICE_BRL = "price_1TK1cyFjQUFfbIeCZhLL7DxA";

// Consultoria: 100€ = 10000 cents / R$600 = 60000 cents
const AMOUNT_CENTS: Record<string, number> = {
  eur: 10000,
  brl: 60000,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization")!;
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { currency = "eur" } = await req.json();
    const priceId = currency === "brl" ? PRICE_BRL : PRICE_EUR;
    const amountCents = AMOUNT_CENTS[currency] || AMOUNT_CENTS.eur;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Generate transfer_group for traceability
    const transferGroup = `cons_${user.id.slice(0, 8)}_${crypto.randomUUID().slice(0, 8)}`;

    // Look up mentor's connected account
    // For consultoria, we look for any connected account marked as mentor
    // In the future this could be parameterized per mentor
    const { data: connectedAccount } = await supabaseClient
      .from("connected_accounts")
      .select("stripe_account_id")
      .eq("onboarding_complete", true)
      .limit(1)
      .maybeSingle();

    let transferData: { destination: string; amount: number } | undefined;
    if (connectedAccount?.stripe_account_id) {
      transferData = {
        destination: connectedAccount.stripe_account_id,
        amount: Math.round(amountCents * 0.85),
      };
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?consultoria_paid=true`,
      cancel_url: `${req.headers.get("origin")}/consultoria?cancelled=true`,
      metadata: {
        user_id: user.id,
        type: "consultoria",
        transfer_group: transferGroup,
      },
      payment_intent_data: {
        transfer_group: transferGroup,
        ...(transferData ? { transfer_data: transferData } : {}),
      },
    });

    // Create purchase record with status "pending" (webhook will confirm)
    await supabaseClient.from("consultoria_purchases").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
