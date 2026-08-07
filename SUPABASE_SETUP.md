# Supabase Database Setup Guide

## ⚠️ IMPORTANT: Follow these steps in order!

### Before You Start:
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **fpqmnfunfpkvdrxfazgj**
3. Navigate to **SQL Editor** from the left sidebar

---

## Step 1: Create Profiles Table

**Where:** Supabase Dashboard → SQL Editor → New Query

Copy and paste this SQL, then click **RUN**:

```sql
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
```

## Step 2: Update Existing Tables Schema

### Orders Table
```sql
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
```

### Prepared Packages Table
```sql
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
```

### Custom Box Options Table
```sql
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
```

## Step 3: Make Your User an Admin

**IMPORTANT:** You must sign in to the app first with Google OAuth before running this step!

1. Go to your app and sign in with Google
2. Come back to Supabase Dashboard → SQL Editor
3. Run this query to find your user ID:

```sql
-- Find your user ID (copy the ID from the results)
SELECT id, email, raw_user_meta_data->>'full_name' as name 
FROM auth.users 
ORDER BY created_at DESC;
```

4. Copy your user ID from the results
5. Run this query (replace YOUR_USER_ID with the ID you copied):

```sql
-- Update your role to admin (REPLACE the YOUR_USER_ID below!)
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';

-- Verify it worked:
SELECT email, role FROM public.profiles WHERE role = 'admin';
```

**Expected Result:** You should see your email with role = 'admin'

## Step 4: Configure Google OAuth Redirect URLs

**Where:** Supabase Dashboard → Authentication → URL Configuration

Add these URLs to **Redirect URLs** list:
- `http://localhost:5173/`
- `http://localhost:5173`
- Your production URL (if deployed)

**Site URL:** `http://localhost:5173`

---

## Step 5: Test the Setup

1. **Sign in to your app** with Google
2. Open browser console (F12) and run:
```javascript
const { data } = await supabase.from('profiles').select('*');
console.log('My profile:', data);
```

3. **Go to Profile Page** (click your avatar → My Profile)
4. **Verify your role** shows as "Admin"
5. **Try accessing Admin Dashboard** at `/admin` route

**Expected Results:**
- ✅ Profile loads successfully
- ✅ You can change your role
- ✅ You can access `/admin` page
- ✅ Your Google profile picture shows in navbar

---

## Step 6: Verify Database Tables

Run this query to check all your tables exist:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- `custom_box_options`
- `orders`
- `prepared_packages`
- `profiles` ← NEW!

---

## 🔴 Current Limitation: Data Still Uses LocalStorage

**IMPORTANT:** Right now, all packages, orders, and custom items are stored in **browser localStorage**, not in Supabase yet.

### What This Means:
- ✅ Authentication works with Supabase
- ✅ Profile management works with Supabase
- ❌ Packages, orders, and custom items are NOT in database yet
- ❌ Admin dashboard changes only save to localStorage
- ❌ Different browsers/devices don't share data

### Next Steps (For Developer):
We need to migrate these functions to use Supabase:
1. `getStoredPackages()` → Fetch from `prepared_packages` table
2. `saveStoredPackages()` → Insert/Update to `prepared_packages` table
3. `getStoredOrders()` → Fetch from `orders` table
4. `saveStoredOrders()` → Insert/Update to `orders` table
5. `getStoredCustomItems()` → Fetch from `custom_box_options` table
6. `saveStoredCustomItems()` → Insert/Update to `custom_box_options` table

These functions are in `src/data/giftsData.ts` and are partially ready but need full implementation.

---

## Troubleshooting

### Issue: Profile table doesn't exist
**Solution:** Go back to Step 1 and run the CREATE TABLE SQL

### Issue: Can't sign in with Google
**Solution:** 
1. Check Step 4 - Redirect URLs must be configured
2. In Supabase Dashboard → Authentication → Providers → Google, make sure it's enabled

### Issue: "Access Denied" when visiting /admin
**Solution:** Run Step 3 again to make yourself admin

### Issue: Changes in admin dashboard don't persist
**Solution:** This is expected - localStorage is being used. Full Supabase integration is next phase.

---

## Next Development Phase: Full Database Migration

Once the profile system is working, we'll need to:

1. **Update Schema:** Add proper columns to existing tables
2. **Create Migration:** Safely move existing localStorage data to Supabase
3. **Update Functions:** Make all CRUD operations use Supabase queries
4. **Add Real-time:** Enable live updates when orders/packages change
5. **Add Images:** Set up Cloudinary or Supabase Storage for product images

**Estimated Work:** Medium-Large task (multiple files need updates)
