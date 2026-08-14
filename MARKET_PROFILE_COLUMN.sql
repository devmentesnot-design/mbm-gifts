-- ============================================================================
-- MBM GIFTS — Market Profile Column Migration
-- ============================================================================
-- Run this in the Supabase SQL Editor.
-- Adds market, currency, country_code, and country_name columns to the
-- profiles table so the backend can enforce market-based pricing.
-- ============================================================================

-- 1. Add market columns to profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='market') THEN
        ALTER TABLE public.profiles ADD COLUMN market TEXT DEFAULT 'ETHIOPIA';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='currency') THEN
        ALTER TABLE public.profiles ADD COLUMN currency TEXT DEFAULT 'ETB';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='country_code') THEN
        ALTER TABLE public.profiles ADD COLUMN country_code TEXT DEFAULT 'ET';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='country_name') THEN
        ALTER TABLE public.profiles ADD COLUMN country_name TEXT DEFAULT 'Ethiopia';
    END IF;
END $$;

-- 2. Migrate any existing orders with 'LOCAL' buyer_market to 'ETHIOPIA'
UPDATE public.orders
SET buyer_market = 'ETHIOPIA'
WHERE buyer_market = 'LOCAL';

-- 3. Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('market', 'currency', 'country_code', 'country_name')
ORDER BY column_name;
