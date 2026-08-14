-- ============================================================================
-- MBM GIFTS — TWO BUYER MARKETS + CHAPA PAYMENT SYSTEM MIGRATION
-- ============================================================================
-- Run this in the Supabase SQL Editor to add dual-market fields, Chapa payment
-- tracking columns, and USD pricing support to all products.
-- ============================================================================

-- 1. Update orders table with buyer market, currency, delivery fee, and Chapa fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='buyer_market') THEN
        ALTER TABLE public.orders ADD COLUMN buyer_market TEXT DEFAULT 'LOCAL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='currency') THEN
        ALTER TABLE public.orders ADD COLUMN currency TEXT DEFAULT 'ETB';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_fee') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_fee NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='chapa_tx_ref') THEN
        ALTER TABLE public.orders ADD COLUMN chapa_tx_ref TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
        ALTER TABLE public.orders ADD COLUMN payment_status TEXT DEFAULT 'PENDING_PAYMENT';
    END IF;
END $$;

-- 2. Update prepared_packages table with USD price
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='price_usd') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN price_usd NUMERIC;
    END IF;
END $$;

-- 3. Update custom_box_options table with USD price
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='price_usd') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN price_usd NUMERIC;
    END IF;
END $$;

-- 4. Update gift_boxes table with USD price
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gift_boxes' AND column_name='price_usd') THEN
        ALTER TABLE public.gift_boxes ADD COLUMN price_usd NUMERIC;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('orders', 'prepared_packages', 'custom_box_options', 'gift_boxes') 
  AND column_name IN ('buyer_market', 'currency', 'delivery_fee', 'chapa_tx_ref', 'payment_status', 'price_usd')
ORDER BY table_name, column_name;
