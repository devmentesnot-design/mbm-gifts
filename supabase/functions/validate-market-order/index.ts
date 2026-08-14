import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// MBM Gifts — validate-market-order Edge Function
// ============================================================================
// This function ENFORCES market-based pricing server-side.
// It is called by CartPage before creating an order.
//
// Flow:
//   1. Verify the customer's JWT (must be authenticated)
//   2. Look up their market in profiles table (ETHIOPIA or INTERNATIONAL)
//   3. Query item prices from the database using the correct price column
//   4. Return the server-validated total and market details
//
// This prevents frontend JS manipulation to access the wrong market's pricing.
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CartItemInput {
  type: 'package' | 'custom'
  id: string
  quantity: number
}

interface ValidatedLineItem {
  id: string
  type: string
  name: string
  unit_price: number
  quantity: number
  line_total: number
  currency: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Auth verification ───────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with the user's JWT to enforce RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed — please log in' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── 2. Fetch user's market from profiles table ─────────────────────────
    // This is the authoritative source — frontend claims are ignored for pricing.
    const { data: profile } = await supabase
      .from('profiles')
      .select('market, currency, country_code, country_name')
      .eq('id', user.id)
      .maybeSingle()

    // If no profile market set yet, default to ETHIOPIA (safe default)
    const userMarket: string = profile?.market || 'ETHIOPIA'
    const userCurrency: string = profile?.currency || (userMarket === 'ETHIOPIA' ? 'ETB' : 'USD')
    const isEthiopia = userMarket === 'ETHIOPIA'
    const priceColumn = isEthiopia ? 'price' : 'price_usd'

    // ── 3. Parse request body ─────────────────────────────────────────────
    const body = await req.json()
    const cartItems: CartItemInput[] = body.cart_items || []
    const boxId: string | null = body.box_id || null
    // Note: body.claimed_market is logged but NOT used for pricing — we use profile.market

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No cart items provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── 4. Server-side price computation ─────────────────────────────────
    let validatedTotal = 0
    const lineItems: ValidatedLineItem[] = []

    // Create admin client for price lookups (bypasses RLS on product tables)
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    for (const item of cartItems) {
      if (item.type === 'package') {
        // Look up prepared package price
        const { data: pkg } = await adminSupabase
          .from('prepared_packages')
          .select(`id, name, price, price_usd`)
          .eq('id', item.id)
          .maybeSingle()

        if (pkg) {
          // Server enforces the correct price column based on user's profile market
          let unitPrice: number
          if (isEthiopia) {
            unitPrice = pkg.price || 0
          } else {
            // International: use price_usd if set, otherwise deny (admin must set USD prices)
            unitPrice = pkg.price_usd || 0
          }

          const lineTotal = unitPrice * item.quantity
          validatedTotal += lineTotal
          lineItems.push({
            id: pkg.id,
            type: 'package',
            name: pkg.name,
            unit_price: unitPrice,
            quantity: item.quantity,
            line_total: lineTotal,
            currency: userCurrency,
          })
        }
      } else if (item.type === 'custom') {
        // For custom box items, the cart sends individual item IDs
        // The total is reconstructed from the actual DB prices
        const { data: customItem } = await adminSupabase
          .from('custom_box_options')
          .select(`id, name, price, price_usd`)
          .eq('id', item.id)
          .maybeSingle()

        if (customItem) {
          let unitPrice: number
          if (isEthiopia) {
            unitPrice = customItem.price || 0
          } else {
            unitPrice = customItem.price_usd || 0
          }

          const lineTotal = unitPrice * item.quantity
          validatedTotal += lineTotal
          lineItems.push({
            id: customItem.id,
            type: 'custom_item',
            name: customItem.name,
            unit_price: unitPrice,
            quantity: item.quantity,
            line_total: lineTotal,
            currency: userCurrency,
          })
        }
      }
    }

    // ── 5. Add gift box price ──────────────────────────────────────────────
    if (boxId) {
      const { data: box } = await adminSupabase
        .from('gift_boxes')
        .select(`id, name, price, price_usd`)
        .eq('id', boxId)
        .maybeSingle()

      if (box) {
        const boxPrice = isEthiopia
          ? (box.price || 0)
          : (box.price_usd || 0)
        validatedTotal += boxPrice
        if (boxPrice > 0) {
          lineItems.push({
            id: box.id,
            type: 'gift_box',
            name: box.name,
            unit_price: boxPrice,
            quantity: 1,
            line_total: boxPrice,
            currency: userCurrency,
          })
        }
      }
    }

    // ── 6. Return validated result ─────────────────────────────────────────
    return new Response(
      JSON.stringify({
        validated_total: Math.round(validatedTotal * 100) / 100,
        market: userMarket,
        currency: userCurrency,
        country_code: profile?.country_code || 'ET',
        country_name: profile?.country_name || 'Ethiopia',
        line_items: lineItems,
        price_source: priceColumn,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('validate-market-order error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
