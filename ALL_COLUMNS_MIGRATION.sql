-- ============================================================================
-- MBM GIFTS — ALL MISSING COLUMNS MIGRATION (ONE-SHOT)
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor.
-- It adds ALL columns needed for: front/back customization, input types,
-- scalable units, size options — safely (IF NOT EXISTS).
-- ============================================================================

DO $$
BEGIN

    -- ========================================================================
    -- A. PREPARED PACKAGES
    -- ========================================================================

    -- Custom input (single-side or legacy)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='requires_custom_input') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN requires_custom_input BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_input_type') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_input_type TEXT DEFAULT 'text';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='custom_input_label') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN custom_input_label TEXT DEFAULT '';
    END IF;

    -- Multi-side (front & back)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='customization_sides') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN customization_sides TEXT DEFAULT 'single';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='front_custom_type') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN front_custom_type TEXT DEFAULT 'both';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='front_custom_label') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN front_custom_label TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='back_custom_type') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_type TEXT DEFAULT 'both';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='back_custom_label') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_label TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='back_custom_optional') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_optional BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='back_custom_price') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_price NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='back_custom_price_usd') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_price_usd NUMERIC DEFAULT 0;
    END IF;

    -- Scalable units
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='has_custom_unit') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN has_custom_unit BOOLEAN DEFAULT false;
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

    -- Size options
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='has_size_options') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN has_size_options BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='size_options') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN size_options JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- ========================================================================
    -- B. CUSTOM BOX OPTIONS (T-Shirts, Mugs, Notebooks, etc.)
    -- ========================================================================

    -- Custom input (single-side or legacy)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='requires_custom_input') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN requires_custom_input BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_input_type') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_input_type TEXT DEFAULT 'text';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='custom_input_label') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN custom_input_label TEXT DEFAULT '';
    END IF;

    -- Multi-side (front & back)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='customization_sides') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN customization_sides TEXT DEFAULT 'single';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='front_custom_type') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN front_custom_type TEXT DEFAULT 'both';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='front_custom_label') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN front_custom_label TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='back_custom_type') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_type TEXT DEFAULT 'both';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='back_custom_label') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_label TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='back_custom_optional') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_optional BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='back_custom_price') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_price NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='back_custom_price_usd') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_price_usd NUMERIC DEFAULT 0;
    END IF;

    -- Scalable units
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='has_custom_unit') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN has_custom_unit BOOLEAN DEFAULT false;
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

    -- Size options
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='has_size_options') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN has_size_options BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='size_options') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN size_options JSONB DEFAULT '[]'::jsonb;
    END IF;

    RAISE NOTICE 'ALL columns verified and ready for both prepared_packages and custom_box_options!';

END $$;

-- Reload PostgREST schema cache so new columns are immediately accessible
NOTIFY pgrst, 'reload schema';
