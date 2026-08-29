/**
 * Centralized Payment Configuration for MBM Gifts
 *
 * Provides extensible configuration for supported payment methods:
 * - Manual Payment (Bank Transfer / Telebirr with Receipt Verification)
 * - Chapa Gateway (Official Online Gateway)
 * - Future Gateways (Easily pluggable)
 *
 * Payment methods can be toggled easily using environment variables
 * or direct configuration without breaking existing integrations.
 */

export interface PaymentAccountOption {
  id: string;
  name: string;
  accountType: 'Mobile Money' | 'Bank Transfer';
  accountNumber: string;
  accountName: string;
  logo?: string;
  instructions?: string;
  badge?: string;
  color?: string;
}

export interface PaymentConfigType {
  // Method feature flags (controlled via ENV or defaults)
  isManualPaymentEnabled: boolean;
  isChapaPaymentEnabled: boolean;

  // Manual payment recipient details
  businessName: string;
  primaryPhone: string;
  supportEmail: string;

  // Supported accounts for manual payment transfers
  accounts: PaymentAccountOption[];

  // Customer instruction copy
  instructions: {
    senderNameHelper: string;
    receiptHelper: string;
    reviewTimeline: string;
  };
}

export const PAYMENT_CONFIG: PaymentConfigType = {
  // Enable / disable payment methods cleanly via environment variables or defaults
  isManualPaymentEnabled: true,
  isChapaPaymentEnabled: false,

  businessName:
    (import.meta as any).env?.VITE_PAYMENT_BUSINESS_NAME || 'DERARA BUSINESS',
  primaryPhone:
    (import.meta as any).env?.VITE_PAYMENT_PHONE || '0912XXXXXX',
  supportEmail: 'mbmgifts.orders@gmail.com',

  accounts: [
    {
      id: 'telebirr',
      name: 'Telebirr',
      accountType: 'Mobile Money',
      accountNumber: (import.meta as any).env?.VITE_PAYMENT_TELEBIRR || '0912XXXXXX',
      accountName: (import.meta as any).env?.VITE_PAYMENT_BUSINESS_NAME || 'DERARA BUSINESS',
      logo: '/telebirr-logo.jpg',
      badge: 'INSTANT / POPULAR',
      instructions: 'Send money via Telebirr transfer to the phone number below and enter the Sender Name.',
    },
    {
      id: 'cbe',
      name: 'Commercial Bank of Ethiopia (CBE)',
      accountType: 'Bank Transfer',
      accountNumber: (import.meta as any).env?.VITE_PAYMENT_CBE || '1000XXXXXXXXX',
      accountName: (import.meta as any).env?.VITE_PAYMENT_BUSINESS_NAME || 'DERARA BUSINESS',
      logo: '/cbe-logo.jpg',
      badge: 'CBE BIRR / CBE MOBILE',
      instructions: 'Transfer via CBE Mobile Banking, CBE Birr, or counter deposit and upload receipt.',
    },
    {
      id: 'abyssinia',
      name: 'Bank of Abyssinia (BOA)',
      accountType: 'Bank Transfer',
      accountNumber: (import.meta as any).env?.VITE_PAYMENT_ABYSSINIA || 'XXXXXXXX',
      accountName: (import.meta as any).env?.VITE_PAYMENT_BUSINESS_NAME || 'DERARA BUSINESS',
      logo: '/abissinya.png',
      badge: 'BOA MOBILE',
      instructions: 'Transfer via Bank of Abyssinia mobile app or branch deposit.',
    },
    {
      id: 'cbe_birr',
      name: 'CBE Birr',
      accountType: 'Mobile Money',
      accountNumber: (import.meta as any).env?.VITE_PAYMENT_CBE_BIRR || '0912XXXXXX',
      accountName: (import.meta as any).env?.VITE_PAYMENT_BUSINESS_NAME || 'DERARA BUSINESS',
      logo: '/cbe-birr.png',
      badge: 'CBE BIRR',
      instructions: 'Send money via CBE Birr to the mobile phone number below.',
    },
  ],

  instructions: {
    senderNameHelper:
      'Please enter the exact name shown on the account or payment application you used to send the money.',
    receiptHelper:
      'Upload a screenshot or photo of your payment receipt (JPG, PNG, WEBP, or PDF).',
    reviewTimeline:
      'Our team will verify your payment and confirm your order promptly.',
  },
};
