-- ============================================================================
-- CRITICAL FIX: Remove localStorage, Database Only
-- ============================================================================
-- This ensures profile is created even if trigger fails
-- Run this AFTER signing in with Google
-- ============================================================================

-- First, check if your profile exists
SELECT * FROM public.profiles;

-- If NO rows returned, create your profile manually:
-- (Replace YOUR_EMAIL with your actual email)

INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Verify it worked:
SELECT * FROM public.profiles WHERE role = 'admin';

-- ============================================================================
-- Check what data you have
-- ============================================================================

SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Packages', COUNT(*) FROM prepared_packages  
UNION ALL
SELECT 'Custom Items', COUNT(*) FROM custom_box_options
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Gift Boxes', COUNT(*) FROM gift_boxes;
