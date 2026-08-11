-- ============================================================================
-- ONE COMPLETE SETUP - PASTE THIS ENTIRE FILE AND RUN ONCE
-- This does EVERYTHING - tables, triggers, policies, seeding
-- ============================================================================

-- ============================================================================
-- 1. CREATE PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users and admins can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users and admins can update profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Auto-create profile trigger (default role = customer)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profile for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'),
  'customer'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. UPDATE ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'Pending',
  customer_info JSONB,
  items JSONB,
  subtotal NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_method TEXT,
  payment_receipt_url TEXT,
  gift_box_style TEXT,
  gift_box_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to existing orders table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_receipt_url') THEN
    ALTER TABLE public.orders ADD COLUMN payment_receipt_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'gift_box_style') THEN
    ALTER TABLE public.orders ADD COLUMN gift_box_style TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'gift_box_price') THEN
    ALTER TABLE public.orders ADD COLUMN gift_box_price NUMERIC DEFAULT 0;
  END IF;
END $$;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;

CREATE POLICY "Anyone can create an order" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users and admins can view orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Users and admins can update orders" ON public.orders
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================================
-- 3. CREATE/UPDATE PREPARED_PACKAGES TABLE
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prepared_packages') THEN
    ALTER TABLE public.prepared_packages ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.prepared_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  badge TEXT,
  description TEXT,
  image TEXT,
  items_included TEXT[],
  items_included_detailed JSONB,
  popular_for TEXT DEFAULT 'Gifting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.prepared_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.prepared_packages;

CREATE POLICY "Anyone can view packages" ON public.prepared_packages
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert packages" ON public.prepared_packages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update packages" ON public.prepared_packages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete packages" ON public.prepared_packages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 4. CREATE/UPDATE CUSTOM_BOX_OPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.custom_box_options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_box_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can manage custom options" ON public.custom_box_options;

CREATE POLICY "Anyone can view custom options" ON public.custom_box_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage custom options" ON public.custom_box_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 5. CREATE CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  type TEXT DEFAULT 'both' CHECK (type IN ('package', 'custom_item', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 6. CREATE GIFT_BOXES TABLE
-- ============================================================================
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

ALTER TABLE public.gift_boxes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view gift boxes" ON public.gift_boxes;
DROP POLICY IF EXISTS "Admins can manage gift boxes" ON public.gift_boxes;

CREATE POLICY "Anyone can view gift boxes" ON public.gift_boxes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gift boxes" ON public.gift_boxes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- ALL DONE! 
-- ============================================================================
-- Now:
-- 1. Sign in to your app with Google
-- 2. Your profile will be auto-created with role='customer'
-- 3. Go to /profile page and change your role to 'admin'
-- 4. The app will auto-seed initial data on first load
-- ============================================================================

SELECT 'Setup Complete! Sign in to your app now.' as message;
