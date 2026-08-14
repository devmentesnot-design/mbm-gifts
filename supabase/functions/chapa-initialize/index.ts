// Supabase Edge Function: chapa-initialize
// Securely initializes a Chapa transaction server-side.
// Called from the frontend via supabase.functions.invoke()

const CHAPA_SECRET_KEY = Deno.env.get('CHAPA_SECRET_KEY') ?? '';
const CHAPA_API_BASE = 'https://api.chapa.co/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
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

    if (!CHAPA_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Chapa API
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
      console.error('Chapa API error:', data);
      return new Response(
        JSON.stringify({ error: data.message || 'Chapa initialization failed', details: data }),
        {
          status: chapaResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
