-- ============================================================================
-- MBM GIFTS — SCALABLE CUSTOM UNITS MIGRATION
-- ============================================================================
-- Run this in the Supabase SQL Editor to add scalable unit support:
-- (e.g. Cakes by KG, Flowers by Stems, Chocolates by Pieces, etc.)
-- for prepared_packages and custom_box_options tables.
-- ============================================================================

DO $$
BEGIN
    -- ========================================================================
    -- 1. PREPARED PACKAGES
    -- ========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='has_custom_unit') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN has_custom_unit BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_unit_name') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_unit_name TEXT DEFAULT 'kg';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_unit_min') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_unit_min NUMERIC DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_unit_step') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_unit_step NUMERIC DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_unit_max') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_unit_max NUMERIC DEFAULT 50;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_unit_price_per_unit') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_unit_price_per_unit NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_unit_price_per_unit_usd') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_unit_price_per_unit_usd NUMERIC;
    END IF;

    -- ========================================================================
    -- 2. CUSTOM BOX OPTIONS (SINGLE ITEMS)
    -- ========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='has_custom_unit') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN has_custom_unit BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_unit_name') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_unit_name TEXT DEFAULT 'kg';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_unit_min') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_unit_min NUMERIC DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_unit_step') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_unit_step NUMERIC DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_unit_max') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_unit_max NUMERIC DEFAULT 50;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_unit_price_per_unit') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_unit_price_per_unit NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_unit_price_per_unit_usd') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_unit_price_per_unit_usd NUMERIC;
    END IF;
END $$;

-- Verify migration columns
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('prepared_packages', 'custom_box_options')
  AND column_name IN (
    'has_custom_unit',
    'custom_unit_name',
    'custom_unit_min',
    'custom_unit_step',
    'custom_unit_max',
    'custom_unit_price_per_unit',
    'custom_unit_price_per_unit_usd'
  )
ORDER BY table_name, ordinal_position;
