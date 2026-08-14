/**
 * Centralized Chapa Payment Service for MBM Gifts
 *
 * Architecture: Frontend → Supabase Edge Functions → Chapa API
 * This keeps the secret key safely on the server side (Edge Function)
 * and the public key on the client for any inline elements.
 *
 * Supports both Local (ETB) and International (USD) checkout flows.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase client for calling Edge Functions
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const getSupabaseClient = () => createClient(supabaseUrl, supabaseAnonKey);

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
// Public key (safe to expose in browser, used for inline/embed if needed)
// ---------------------------------------------------------------------------
export const getChapaPublicKey = (): string => {
  return (
    (import.meta as any).env?.VITE_CHAPA_PUBLIC_KEY ||
    'CHAPUBK_TEST-s5ZLQUqw12IoT7FOZsccD9QmplFuJeyE'
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
// Initialize a Chapa payment transaction via Supabase Edge Function
// ---------------------------------------------------------------------------
export const initializeChapaTransaction = async (
  params: ChapaInitializeParams
): Promise<ChapaInitializeResponse> => {
  const formattedAmount = Number(params.amount).toFixed(2);

  const payload = {
    amount: formattedAmount,
    currency: params.currency,
    email: params.email || 'customer@mbmgifts.com',
    first_name: params.firstName || 'Valued',
    last_name: params.lastName || 'Customer',
    phone_number: params.phone || '',
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

  console.log('🚀 Initializing Chapa Transaction via Edge Function:', {
    tx_ref: payload.tx_ref,
    amount: payload.amount,
    currency: payload.currency,
  });

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('chapa-initialize', {
      body: payload,
    });

    if (error) {
      console.error('❌ Edge Function error (chapa-initialize):', error);
      return {
        status: 'error',
        message: error.message || 'Failed to connect to payment service',
      };
    }

    if (!data || data.status !== 'success') {
      console.error('❌ Chapa initialization failed:', data);
      return {
        status: 'failed',
        message: data?.message || 'Failed to initialize Chapa transaction',
        data: data?.data,
      };
    }

    console.log('✅ Chapa transaction initialized:', data.data?.checkout_url);
    return {
      status: 'success',
      message: data.message || 'Transaction initialized',
      data: data.data,
    };
  } catch (err: any) {
    console.error('❌ Unexpected error initializing Chapa transaction:', err);
    return {
      status: 'error',
      message: err.message || 'Network error connecting to payment gateway',
    };
  }
};

// ---------------------------------------------------------------------------
// Verify a completed transaction via Supabase Edge Function
// ---------------------------------------------------------------------------
export const verifyChapaTransaction = async (
  txRef: string
): Promise<ChapaVerifyResponse> => {
  console.log('🔍 Verifying Chapa transaction via Edge Function:', txRef);

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('chapa-verify', {
      body: { tx_ref: txRef },
    });

    if (error) {
      console.error('❌ Edge Function error (chapa-verify):', error);
      return {
        status: 'error',
        message: error.message || 'Failed to connect to verification service',
      };
    }

    if (!data || data.status !== 'success') {
      console.error('❌ Chapa verification failed:', data);
      return {
        status: 'failed',
        message: data?.message || 'Chapa verification failed',
        data: data?.data,
      };
    }

    console.log('✅ Chapa transaction verified:', data.data);
    return {
      status: 'success',
      message: data.message || 'Transaction verified',
      data: data.data,
    };
  } catch (err: any) {
    console.error('❌ Unexpected error verifying Chapa transaction:', err);
    return {
      status: 'error',
      message: err.message || 'Network error verifying transaction',
    };
  }
};
