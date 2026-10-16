-- ============================================================================
-- MBM GIFTS — MULTI-SIDE CUSTOMIZATION MIGRATION (FRONT & BACK SIDES)
-- ============================================================================
-- Run this in the Supabase SQL Editor to enable front & back customization
-- for items like T-Shirts, Mugs, Notebooks, and Custom Packages.
-- ============================================================================

DO $$
BEGIN
    -- ========================================================================
    -- 1. PREPARED PACKAGES
    -- ========================================================================
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
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_optional BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='back_custom_price') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_price NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prepared_packages' AND column_name='back_custom_price_usd') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN back_custom_price_usd NUMERIC DEFAULT 0;
    END IF;

    -- ========================================================================
    -- 2. CUSTOM BOX OPTIONS (SINGLE ITEMS: T-SHIRTS, MUGS, NOTEBOOKS, ETC.)
    -- ========================================================================
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
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_optional BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='back_custom_price') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_price NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_box_options' AND column_name='back_custom_price_usd') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN back_custom_price_usd NUMERIC DEFAULT 0;
    END IF;

    RAISE NOTICE '✅ Multi-Side Customization (Front & Back) columns verified and ready!';
END $$;
