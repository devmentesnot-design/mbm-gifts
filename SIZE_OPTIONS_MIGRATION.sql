-- =========================================================================
-- SIZE OPTIONS MIGRATION FOR PREPARED PACKAGES & CUSTOM BOX OPTIONS
-- =========================================================================
-- Run this script in the Supabase SQL Editor if you want persistent database
-- storage for size options (S, M, L, XL, etc.) across products and packages.

-- 1. Add size option columns to prepared_packages
ALTER TABLE IF EXISTS prepared_packages
  ADD COLUMN IF NOT EXISTS has_size_options BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS size_options JSONB DEFAULT '[]'::jsonb;

-- 2. Add size option columns to custom_box_options
ALTER TABLE IF EXISTS custom_box_options
  ADD COLUMN IF NOT EXISTS has_size_options BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS size_options JSONB DEFAULT '[]'::jsonb;

-- 3. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
