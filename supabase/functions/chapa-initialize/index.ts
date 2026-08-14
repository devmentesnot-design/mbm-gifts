// Supabase Edge Function: chapa-initialize
// Securely initializes a Chapa transaction server-side.
// Called from the frontend via supabase.functions.invoke('chapa-initialize')

const CHAPA_SECRET_KEY = Deno.env.get('CHAPA_SECRET_KEY') ?? '';
const CHAPA_API_BASE = 'https://api.chapa.co/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Chapa allows only letters, numbers, hyphens, underscores, spaces, and dots in description/title
const sanitizeChapaText = (text: string, fallback: string): string => {
  if (!text) return fallback;
  const cleaned = text.replace(/[^a-zA-Z0-9 ._-]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned.slice(0, 100) : fallback;
};

// Strict email validator
const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
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

    // Validate and sanitize currency
    const validCurrency = currency === 'USD' ? 'USD' : 'ETB';

    // Validate and sanitize amount
    const parsedAmount = parseFloat(String(amount || '0'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new Response(
        JSON.stringify({ status: 'failed', message: 'Invalid order amount' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const formattedAmount = parsedAmount.toFixed(2);

    // Validate tx_ref (only alphanumeric and hyphens)
    const rawTx = typeof tx_ref === 'string' ? tx_ref.trim() : '';
    const finalTxRef = rawTx ? rawTx.replace(/[^a-zA-Z0-9_-]/g, '') : `MBM-TX-${Date.now()}`;

    // Validate and sanitize email
    let cleanEmail = (typeof email === 'string' ? email.trim() : '');
    if (!isValidEmail(cleanEmail)) {
      cleanEmail = 'customer@mbmgifts.com';
    }

    // Sanitize names
    const cleanFirstName = sanitizeChapaText(first_name, 'Customer');
    const cleanLastName = sanitizeChapaText(last_name, 'User');

    // Sanitize phone
    let cleanPhone = (typeof phone_number === 'string' ? phone_number.replace(/[^0-9+]/g, '') : '');
    if (!cleanPhone || cleanPhone.length < 9) {
      cleanPhone = '0911000000';
    }

    // Sanitize customization title and description according to Chapa's strict regex
    const customTitle = sanitizeChapaText(customization?.title, 'MBM Gifts');
    const customDesc = sanitizeChapaText(customization?.description, 'Gift Delivery Ethiopia');

    const secretKey = CHAPA_SECRET_KEY || 'CHASECK_TEST-XWw4AWaaNeYHYuO38OpmghdwqYpb44fI';

    const chapaPayload: Record<string, any> = {
      first_name: cleanFirstName,
      last_name: cleanLastName,
      email: cleanEmail,
      phone_number: cleanPhone,
      currency: validCurrency,
      amount: formattedAmount,
      tx_ref: finalTxRef,
      customization: {
        title: customTitle,
        description: customDesc,
      },
    };

    if (return_url && typeof return_url === 'string' && return_url.startsWith('http')) {
      chapaPayload.return_url = return_url;
    }
    if (callback_url && typeof callback_url === 'string' && callback_url.startsWith('http')) {
      chapaPayload.callback_url = callback_url;
    }

    console.log('Sending Chapa initialization payload:', JSON.stringify(chapaPayload));

    // Call Chapa API
    const chapaResponse = await fetch(`${CHAPA_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(chapaPayload),
    });

    const data = await chapaResponse.json().catch(() => null);

    if (!chapaResponse.ok || !data || data.status !== 'success') {
      console.error('Chapa API rejected transaction:', data);
      const errMsg = typeof data?.message === 'string'
        ? data.message
        : (data?.message ? JSON.stringify(data.message) : 'Chapa payment gateway rejected the request');

      return new Response(
        JSON.stringify({
          status: 'failed',
          message: errMsg,
          details: data,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Success response with checkout_url
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function caught exception:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error processing payment',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
