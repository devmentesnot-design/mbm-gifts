/**
 * Centralized Chapa Payment Service for MBM Gifts
 *
 * Architecture:
 * Frontend → Supabase Edge Functions (`chapa-initialize` / `chapa-verify`) → Chapa API
 *
 * Supports both Local (ETB) and International (USD) checkout flows.
 */

import { supabase } from '../lib/supabase';

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
  if (!email) return 'mbmgifts.orders@gmail.com';
  const clean = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(clean) && !clean.includes('example.com') ? clean : 'mbmgifts.orders@gmail.com';
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
    phone_number: params.phone?.trim() || '0911000000',
    tx_ref: params.txRef,
    callback_url:
      params.callbackUrl || `${window.location.origin}/api/chapa-webhook`,
    return_url:
      params.returnUrl ||
      `${window.location.origin}/checkout/payment?tx_ref=${params.txRef}&status=success`,
    customization: {
      title: 'MBM Gifts',
      description: `Order ${params.txRef}`,
    },
  };

  console.log('🚀 Initializing Chapa Transaction:', {
    tx_ref: payload.tx_ref,
    amount: payload.amount,
    currency: payload.currency,
    email: payload.email,
  });

  try {
    const { data, error } = await supabase.functions.invoke('chapa-initialize', {
      body: payload,
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      return {
        status: 'error',
        message: error.message || 'Error connecting to payment gateway',
      };
    }

    if (data?.status === 'success' && data.data?.checkout_url) {
      console.log('✅ Chapa initialized successfully:', data.data.checkout_url);
      return {
        status: 'success',
        message: data.message || 'Transaction initialized',
        data: data.data,
      };
    }

    return {
      status: 'failed',
      message: data?.message || 'Payment initialization was not approved by gateway',
      data: data?.data,
    };
  } catch (err: any) {
    console.error('❌ Unexpected payment initialization error:', err);
    return {
      status: 'error',
      message: err.message || 'Network error connecting to payment gateway',
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

  try {
    const { data, error } = await supabase.functions.invoke('chapa-verify', {
      body: { tx_ref: txRef },
    });

    if (error) {
      console.error('❌ Supabase verify function error:', error);
      return {
        status: 'error',
        message: error.message || 'Error verifying transaction',
      };
    }

    if (data?.status === 'success') {
      console.log('✅ Chapa transaction verified:', data.data);
      return {
        status: 'success',
        message: data.message || 'Transaction verified',
        data: data.data,
      };
    }

    return {
      status: 'failed',
      message: data?.message || 'Transaction could not be verified with Chapa',
      data: data?.data,
    };
  } catch (err: any) {
    console.error('❌ Unexpected error verifying transaction:', err);
    return {
      status: 'error',
      message: err.message || 'Network error verifying transaction',
    };
  }
};
