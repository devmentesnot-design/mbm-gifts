-- ============================================================================
-- MBM GIFTS - COMPLETE DATABASE SETUP
-- ============================================================================
-- Run this entire file in Supabase SQL Editor (paste all at once)
-- This will create profiles table and update all existing tables
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE PROFILES TABLE
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 2A: UPDATE ORDERS TABLE
-- ============================================================================

-- Check if orders table needs updates
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='user_id') THEN
        ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='status') THEN
        ALTER TABLE public.orders ADD COLUMN status TEXT DEFAULT 'Pending';
    END IF;
    
    -- Add customer_info column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='customer_info') THEN
        ALTER TABLE public.orders ADD COLUMN customer_info JSONB;
    END IF;
    
    -- Add items column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='items') THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB;
    END IF;
    
    -- Add subtotal column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='subtotal') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal NUMERIC DEFAULT 0;
    END IF;
    
    -- Add shipping column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='shipping') THEN
        ALTER TABLE public.orders ADD COLUMN shipping NUMERIC DEFAULT 0;
    END IF;
    
    -- Add total column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='total') THEN
        ALTER TABLE public.orders ADD COLUMN total NUMERIC DEFAULT 0;
    END IF;
    
    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='payment_method') THEN
        ALTER TABLE public.orders ADD COLUMN payment_method TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='created_at') THEN
        ALTER TABLE public.orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- STEP 2B: UPDATE PREPARED_PACKAGES TABLE
-- ============================================================================

-- Check if prepared_packages needs updates
DO $$
BEGIN
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='rating') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN rating NUMERIC DEFAULT 5.0;
    END IF;
    
    -- Add reviews_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='reviews_count') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN reviews_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add badge column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='badge') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN badge TEXT;
    END IF;
    
    -- Add items_included column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='items_included') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN items_included TEXT[];
    END IF;
    
    -- Add items_included_detailed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='items_included_detailed') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN items_included_detailed JSONB;
    END IF;
    
    -- Add popular_for column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='popular_for') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN popular_for TEXT DEFAULT 'Gifting';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='created_at') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prepared_packages' AND column_name='updated_at') THEN
        ALTER TABLE public.prepared_packages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.prepared_packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.prepared_packages;

-- Anyone can read packages
CREATE POLICY "Anyone can view packages" ON public.prepared_packages
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert packages" ON public.prepared_packages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update packages" ON public.prepared_packages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete packages" ON public.prepared_packages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- STEP 2C: UPDATE CUSTOM_BOX_OPTIONS TABLE
-- ============================================================================

-- Check if custom_box_options needs updates
DO $$
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='custom_box_options' AND column_name='created_at') THEN
        ALTER TABLE public.custom_box_options ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.custom_box_options ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can insert custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can update custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can delete custom options" ON public.custom_box_options;

-- Anyone can read
CREATE POLICY "Anyone can view custom options" ON public.custom_box_options
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert custom options" ON public.custom_box_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update custom options" ON public.custom_box_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete custom options" ON public.custom_box_options
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Sign in to your app with Google
-- 2. Run the admin setup query to make yourself admin
-- 3. Test your application
-- ============================================================================

-- ============================================================================
-- STEP 3: CREATE MISSING TABLES (CATEGORIES & GIFT BOXES)
-- ============================================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  type TEXT DEFAULT 'both' CHECK (type IN ('package', 'custom_item', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Anyone can read categories
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create gift_boxes table
CREATE TABLE IF NOT EXISTS public.gift_boxes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dimensions TEXT,
  price NUMERIC DEFAULT 0,
  color TEXT,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gift_boxes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view gift boxes" ON public.gift_boxes;
DROP POLICY IF EXISTS "Admins can manage gift boxes" ON public.gift_boxes;

-- Anyone can read gift boxes
CREATE POLICY "Anyone can view gift boxes" ON public.gift_boxes
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage gift boxes" ON public.gift_boxes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- ALL TABLES ARE NOW READY!
-- ============================================================================
