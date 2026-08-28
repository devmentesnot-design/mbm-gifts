-- ============================================================================
-- MBM GIFTS — MANUAL PAYMENT VERIFICATION SYSTEM MIGRATION
-- ============================================================================
-- Run this in the Supabase SQL Editor to add manual payment verification columns:
-- sender_name, transaction_id, rejection_reason, payment_submitted_at, 
-- reviewed_at, reviewed_by to the orders table.
-- ============================================================================

DO $$
BEGIN
    -- 1. Sender name used by customer to send the payment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='sender_name') THEN
        ALTER TABLE public.orders ADD COLUMN sender_name TEXT;
    END IF;

    -- 2. Optional transaction / reference ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='transaction_id') THEN
        ALTER TABLE public.orders ADD COLUMN transaction_id TEXT;
    END IF;

    -- 3. Payment receipt / screenshot URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_receipt_url') THEN
        ALTER TABLE public.orders ADD COLUMN payment_receipt_url TEXT;
    END IF;

    -- 4. Payment status (PENDING_PAYMENT, PAYMENT_SUBMITTED, UNDER_REVIEW, PAID, REJECTED, CANCELLED)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
        ALTER TABLE public.orders ADD COLUMN payment_status TEXT DEFAULT 'PENDING_PAYMENT';
    END IF;

    -- 5. Rejection reason if admin rejects the manual payment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='rejection_reason') THEN
        ALTER TABLE public.orders ADD COLUMN rejection_reason TEXT;
    END IF;

    -- 6. Timestamps for submission and review
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_submitted_at') THEN
        ALTER TABLE public.orders ADD COLUMN payment_submitted_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='reviewed_at') THEN
        ALTER TABLE public.orders ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;

    -- 7. Admin identifier who approved / rejected the payment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='reviewed_by') THEN
        ALTER TABLE public.orders ADD COLUMN reviewed_by TEXT;
    END IF;
END $$;

-- Verify migration columns
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN (
    'sender_name',
    'transaction_id',
    'payment_receipt_url',
    'payment_status',
    'rejection_reason',
    'payment_submitted_at',
    'reviewed_at',
    'reviewed_by'
  )
ORDER BY ordinal_position;
