// Supabase Edge Function: chapa-verify
// Securely verifies a Chapa transaction server-side.
// Called from the frontend via supabase.functions.invoke('chapa-verify')

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
      return new Response(
        JSON.stringify({ status: 'failed', message: 'Method not allowed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { tx_ref } = body;

    if (!tx_ref) {
      return new Response(
        JSON.stringify({ status: 'failed', message: 'Missing transaction reference (tx_ref)' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = CHAPA_SECRET_KEY || 'CHASECK_TEST-XWw4AWaaNeYHYuO38OpmghdwqYpb44fI';

    // Verify with Chapa API
    const chapaResponse = await fetch(`${CHAPA_API_BASE}/transaction/verify/${encodeURIComponent(tx_ref)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: 'application/json',
      },
    });

    const data = await chapaResponse.json().catch(() => null);

    if (!chapaResponse.ok || !data || data.status !== 'success') {
      console.error('Chapa verify rejection:', data);
      const errMsg = typeof data?.message === 'string'
        ? data.message
        : (data?.message ? JSON.stringify(data.message) : 'Transaction verification failed');

      return new Response(
        JSON.stringify({
          status: 'failed',
          message: errMsg,
          details: data,
        }),
        {
          status: 200, // Return 200 so client gets clean status response
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function verify caught exception:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal error during verification',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
