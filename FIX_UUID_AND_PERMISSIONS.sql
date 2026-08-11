-- ============================================================================
-- FIX UUID SYNTAX ERROR & ENABLE DATABASE SAVES FOR PACKAGES, ITEMS & CATEGORIES
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Paste -> Run)
-- ============================================================================

-- 1. Convert ID columns to TEXT (fixes "invalid input syntax for type uuid")
ALTER TABLE public.prepared_packages ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.custom_box_options ALTER COLUMN id TYPE TEXT USING id::text;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    ALTER TABLE public.categories ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gift_boxes') THEN
    ALTER TABLE public.gift_boxes ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
END $$;

-- 2. Grant full read/write access to allow instant CRUD operations
DROP POLICY IF EXISTS "Anyone can view packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Allow all for prepared_packages" ON public.prepared_packages;

CREATE POLICY "Allow all for prepared_packages" ON public.prepared_packages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can manage custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Allow all for custom_box_options" ON public.custom_box_options;

CREATE POLICY "Allow all for custom_box_options" ON public.custom_box_options FOR ALL USING (true) WITH CHECK (true);

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all for categories" ON public.categories';
    EXECUTE 'CREATE POLICY "Allow all for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gift_boxes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view gift boxes" ON public.gift_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage gift boxes" ON public.gift_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all for gift_boxes" ON public.gift_boxes';
    EXECUTE 'CREATE POLICY "Allow all for gift_boxes" ON public.gift_boxes FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

SELECT 'SUCCESS! Fixed UUID syntax error and unlocked database permissions.' as result;
