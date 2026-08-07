-- ============================================================================
-- FIX RLS INFINITE RECURSION & ORDER INSERT PERMISSIONS
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Create a helper function with SECURITY DEFINER to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Grant execution to authenticated & anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;


-- ============================================================================
-- 2. FIX PROFILES TABLE RLS POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Allow users to view their own profile, or admins to view any profile
CREATE POLICY "Users and admins can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Allow users to update their own profile, or admins to update any profile
CREATE POLICY "Users and admins can update profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Allow new user profile insertion
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());


-- ============================================================================
-- 3. FIX ORDERS TABLE RLS POLICIES
-- ============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
DROP POLICY IF EXISTS "Users and admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users and admins can update orders" ON public.orders;

-- Allow ANY user (authenticated or guest/anon) to place an order
CREATE POLICY "Anyone can create an order" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own orders or admins to view all orders
CREATE POLICY "Users and admins can view orders" ON public.orders
  FOR SELECT USING (
    user_id = auth.uid() 
    OR user_id IS NULL 
    OR public.is_admin()
  );

-- Allow admins or order owners to update an order
CREATE POLICY "Users and admins can update orders" ON public.orders
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR public.is_admin()
  );


-- ============================================================================
-- 4. FIX PREPARED PACKAGES RLS POLICIES
-- ============================================================================
ALTER TABLE public.prepared_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can update packages" ON public.prepared_packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON public.prepared_packages;

CREATE POLICY "Anyone can view packages" ON public.prepared_packages
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert packages" ON public.prepared_packages
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update packages" ON public.prepared_packages
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete packages" ON public.prepared_packages
  FOR DELETE USING (public.is_admin());


-- ============================================================================
-- 5. FIX CUSTOM BOX OPTIONS / ITEMS RLS POLICIES
-- ============================================================================
ALTER TABLE public.custom_box_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can insert custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can update custom options" ON public.custom_box_options;
DROP POLICY IF EXISTS "Admins can delete custom options" ON public.custom_box_options;

CREATE POLICY "Anyone can view custom options" ON public.custom_box_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert custom options" ON public.custom_box_options
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update custom options" ON public.custom_box_options
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete custom options" ON public.custom_box_options
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================
SELECT 'RLS Fix Applied Successfully!' as status;
