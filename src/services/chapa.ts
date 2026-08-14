/**
 * Centralized Chapa Payment Service for MBM Gifts
 *
 * Architecture:
 * 1. Primary: Calls Supabase Edge Functions (`chapa-initialize` / `chapa-verify`)
 * 2. Fallback: Direct REST API if Edge Function is unreachable
 *
 * Supports both Local (ETB) and International (USD) checkout flows.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase client for calling Edge Functions
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fpqmnfunfpkvdrxfazgj.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const getSupabaseClient = () => createClient(supabaseUrl, supabaseAnonKey);

const CHAPA_API_URL = 'https://api.chapa.co/v1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChapaInitializeParams {
  amount: number;
  currency: 'ETB' | 'USD';
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  txRef: string;
  callbackUrl?: string;
  returnUrl?: string;
  customTitle?: string;
  customDescription?: string;
}

export interface ChapaInitializeResponse {
  status: 'success' | 'failed' | 'error';
  message: string;
  data?: {
    checkout_url: string;
  };
}

export interface ChapaVerifyResponse {
  status: 'success' | 'failed' | 'error';
  message: string;
  data?: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: number;
    charge: number;
    mode: string;
    method: string;
    type: string;
    status: 'success' | 'pending' | 'failed';
    reference: string;
    tx_ref: string;
    created_at: string;
    updated_at: string;
  };
}

// ---------------------------------------------------------------------------
// Helper: Email validation & sanitization
// ---------------------------------------------------------------------------
const sanitizeEmail = (email?: string): string => {
  if (!email) return 'orders@mbmgifts.com';
  const clean = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean) ? clean : 'orders@mbmgifts.com';
};

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------
export const getChapaPublicKey = (): string => {
  return (
    (import.meta as any).env?.VITE_CHAPA_PUBLIC_KEY ||
    'CHAPUBK_TEST-s5ZLQUqw12IoT7FOZsccD9QmplFuJeyE'
  );
};

export const getChapaSecretKey = (): string => {
  return (
    (import.meta as any).env?.VITE_CHAPA_SECRET_KEY ||
    'CHASECK_TEST-XWw4AWaaNeYHYuO38OpmghdwqYpb44fI'
  );
};

// ---------------------------------------------------------------------------
// Generate a unique transaction reference (tx_ref)
// ---------------------------------------------------------------------------
export const generateTxRef = (orderId?: string): string => {
  const cleanId = orderId ? orderId.replace(/[^a-zA-Z0-9_-]/g, '') : 'ORD';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `MBM-${cleanId}-${timestamp}-${randomSuffix}`;
};

// ---------------------------------------------------------------------------
// Initialize a Chapa payment transaction
// ---------------------------------------------------------------------------
export const initializeChapaTransaction = async (
  params: ChapaInitializeParams
): Promise<ChapaInitializeResponse> => {
  const formattedAmount = Number(params.amount).toFixed(2);
  const cleanEmail = sanitizeEmail(params.email);

  const payload = {
    amount: formattedAmount,
    currency: params.currency,
    email: cleanEmail,
    first_name: params.firstName?.trim() || 'Valued',
    last_name: params.lastName?.trim() || 'Customer',
    phone_number: params.phone?.replace(/[^0-9+]/g, '') || '0911000000',
    tx_ref: params.txRef,
    callback_url:
      params.callbackUrl || `${window.location.origin}/api/chapa-webhook`,
    return_url:
      params.returnUrl ||
      `${window.location.origin}/checkout/payment?tx_ref=${params.txRef}&status=success`,
    customization: {
      title: params.customTitle || 'MBM Gifts — Luxury Gift Experience',
      description:
        params.customDescription ||
        `Payment for ${params.currency === 'USD' ? 'International' : 'Local'} Gift Order (${params.txRef})`,
    },
  };

  console.log('🚀 Initializing Chapa Transaction:', {
    tx_ref: payload.tx_ref,
    amount: payload.amount,
    currency: payload.currency,
    email: payload.email,
  });

  // 1. Try Supabase Edge Function
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('chapa-initialize', {
      body: payload,
    });

    if (!error && data && data.status === 'success' && data.data?.checkout_url) {
      console.log('✅ Chapa initialized via Edge Function:', data.data.checkout_url);
      return {
        status: 'success',
        message: data.message || 'Transaction initialized',
        data: data.data,
      };
    }

    if (data && data.status === 'failed') {
      console.warn('⚠️ Edge Function returned failure message:', data.message);
    }
  } catch (edgeErr) {
    console.warn('⚠️ Edge Function invocation failed, trying direct fallback:', edgeErr);
  }

  // 2. Direct Fallback if Edge function returned error or was unreachable
  console.log('🔄 Executing direct Chapa API fallback...');
  try {
    const secretKey = getChapaSecretKey();
    const res = await fetch(`${CHAPA_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const directData = await res.json().catch(() => null);

    if (res.ok && directData?.status === 'success' && directData.data?.checkout_url) {
      console.log('✅ Chapa initialized via Direct API fallback:', directData.data.checkout_url);
      return {
        status: 'success',
        message: directData.message || 'Transaction initialized',
        data: directData.data,
      };
    }

    const msg = typeof directData?.message === 'string'
      ? directData.message
      : (directData?.message ? JSON.stringify(directData.message) : 'Payment gateway initialization failed');

    return {
      status: 'failed',
      message: msg,
      data: directData?.data,
    };
  } catch (directErr: any) {
    console.error('❌ Direct Chapa initialization failed:', directErr);
    return {
      status: 'error',
      message: directErr.message || 'Unable to connect to Chapa payment gateway.',
    };
  }
};

// ---------------------------------------------------------------------------
// Verify a completed transaction
// ---------------------------------------------------------------------------
export const verifyChapaTransaction = async (
  txRef: string
): Promise<ChapaVerifyResponse> => {
  console.log('🔍 Verifying Chapa transaction:', txRef);

  // 1. Try Supabase Edge Function
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('chapa-verify', {
      body: { tx_ref: txRef },
    });

    if (!error && data && data.status === 'success') {
      console.log('✅ Chapa transaction verified via Edge Function:', data.data);
      return {
        status: 'success',
        message: data.message || 'Transaction verified',
        data: data.data,
      };
    }
  } catch (edgeErr) {
    console.warn('⚠️ Edge Function verify failed, trying direct fallback:', edgeErr);
  }

  // 2. Direct Fallback
  try {
    const secretKey = getChapaSecretKey();
    const res = await fetch(`${CHAPA_API_URL}/transaction/verify/${encodeURIComponent(txRef)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const directData = await res.json().catch(() => null);

    if (res.ok && directData?.status === 'success') {
      console.log('✅ Chapa transaction verified via Direct API:', directData.data);
      return {
        status: 'success',
        message: directData.message || 'Transaction verified',
        data: directData.data,
      };
    }

    return {
      status: 'failed',
      message: directData?.message || 'Chapa verification failed',
      data: directData?.data,
    };
  } catch (directErr: any) {
    console.error('❌ Direct Chapa verify error:', directErr);
    return {
      status: 'error',
      message: directErr.message || 'Network error verifying transaction with Chapa',
    };
  }
};
