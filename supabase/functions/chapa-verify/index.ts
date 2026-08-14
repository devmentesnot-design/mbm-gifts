// Supabase Edge Function: chapa-verify
// Securely verifies a Chapa transaction server-side.
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
    const { tx_ref } = body;

    if (!tx_ref) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: tx_ref' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!CHAPA_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify with Chapa API
    const chapaResponse = await fetch(`${CHAPA_API_BASE}/transaction/verify/${tx_ref}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        Accept: 'application/json',
      },
    });

    const data = await chapaResponse.json();

    if (!chapaResponse.ok) {
      console.error('Chapa verify error:', data);
      return new Response(
        JSON.stringify({ error: data.message || 'Chapa verification failed', details: data }),
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
