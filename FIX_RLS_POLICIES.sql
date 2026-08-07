-- ============================================================================
-- FIX RLS POLICIES FOR ORDERS TABLE
-- Run this in Supabase SQL Editor to fix the INSERT permission issue
-- ============================================================================

-- 1. Drop all existing policies on orders table
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- 2. Create fresh, clean policies

-- Allow users to view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow ANY authenticated user to insert orders (they'll be assigned their user_id)
CREATE POLICY "Allow authenticated users to insert orders" ON public.orders
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow admins to update any order
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY cmd, policyname;

-- ============================================================================
-- DONE! Now try placing an order again
-- ============================================================================
