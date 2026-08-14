// Supabase Edge Function: chapa-initialize
// Securely initializes a Chapa transaction using the server-side SDK.
// Called from the frontend to avoid exposing the secret key in the browser.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CHAPA_SECRET_KEY = Deno.env.get('CHAPA_SECRET_KEY') ?? '';
const CHAPA_API_BASE = 'https://api.chapa.co/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone_number,
      currency,
      amount,
      tx_ref,
      return_url,
      callback_url,
      customization,
    } = body;

    // Validate required fields
    if (!currency || !amount || !tx_ref || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: currency, amount, tx_ref, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Chapa API directly (SDK pattern but using fetch for Deno compatibility)
    const chapaResponse = await fetch(`${CHAPA_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        first_name: first_name || 'Customer',
        last_name: last_name || 'User',
        email,
        phone_number: phone_number || '',
        currency,
        amount: String(amount),
        tx_ref,
        return_url,
        callback_url,
        customization: customization || {
          title: 'MBM Gifts',
          description: 'Gift delivery to Ethiopia',
        },
      }),
    });

    const data = await chapaResponse.json();

    if (!chapaResponse.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Chapa initialization failed' }), {
        status: chapaResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
