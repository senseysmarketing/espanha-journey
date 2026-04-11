import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Auth
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { event_id } = await req.json();
    if (!event_id) throw new Error("event_id is required");

    // Fetch event
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) throw new Error("Event not found");
    if (!event.stripe_price_id) throw new Error("This event has no payment configured");

    // Check capacity for limited events
    if (event.max_capacity) {
      const { count } = await supabaseClient
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event_id)
        .in("status", ["confirmed", "paid", "pending"]);

      if (count !== null && count >= event.max_capacity) {
        return new Response(
          JSON.stringify({ error: "Evento esgotado", sold_out: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    // Init Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Generate transfer_group for traceability
    const transferGroup = `evt_${event_id}_${crypto.randomUUID().slice(0, 8)}`;

    // Look up organizer's connected account for transfer
    let transferData: { destination: string; amount: number } | undefined;
    if (event.organizer_user_id) {
      const { data: connectedAccount } = await supabaseClient
        .from("connected_accounts")
        .select("stripe_account_id")
        .eq("user_id", event.organizer_user_id)
        .eq("onboarding_complete", true)
        .maybeSingle();

      if (connectedAccount?.stripe_account_id) {
        transferData = {
          destination: connectedAccount.stripe_account_id,
          amount: Math.round(event.price_cents * 0.85),
        };
      }
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: event.stripe_price_id, quantity: 1 }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?event_paid=${event_id}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?event_cancelled=${event_id}`,
      metadata: {
        event_id,
        user_id: user.id,
        type: "event",
        transfer_group: transferGroup,
      },
      payment_intent_data: {
        transfer_group: transferGroup,
        ...(transferData ? { transfer_data: transferData } : {}),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create pending RSVP (status "pending" until webhook confirms)
    const ticketCode = crypto.randomUUID().slice(0, 8).toUpperCase();
    await supabaseClient.from("event_rsvps").upsert(
      {
        event_id,
        user_id: user.id,
        status: "pending",
        stripe_payment_id: session.id,
        ticket_code: ticketCode,
      },
      { onConflict: "event_id,user_id" }
    );

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
