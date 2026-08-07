# 🔍 Test Your Database Connection

## Step 1: Check if Tables Exist

Open Supabase SQL Editor and run:

```sql
-- Check all your tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected result:**
- custom_box_options
- orders
- prepared_packages
- profiles

---

## Step 2: Check if Profile Was Created

After signing in with Google, run:

```sql
-- Check if your profile exists
SELECT * FROM public.profiles;
```

**Expected:** You should see your profile with your email

**If empty:** The trigger didn't fire. Let's fix it manually:

```sql
-- Manually create your profile
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';
```

---

## Step 3: Check if Initial Data Was Seeded

After opening the app, run:

```sql
-- Check packages
SELECT COUNT(*) as package_count FROM prepared_packages;

-- Check custom items
SELECT COUNT(*) as item_count FROM custom_box_options;
```

**Expected:**
- package_count: 4
- item_count: 12

**If 0:** Open browser console (F12) and look for these logs:
- 🌱 Seeding initial data...
- ✅ Seeded X packages
- ✅ Seeded X custom items

---

## Step 4: Test Creating a Package in Admin

1. Go to http://localhost:5173/admin
2. Click "Ready-made Packages" tab
3. Click "Add New Package"
4. Fill in:
   - Name: Test Package
   - Category: Luxury
   - Price: 99.99
   - Description: Test
5. Click Save

Then run in SQL Editor:

```sql
-- Check if package was saved
SELECT * FROM prepared_packages WHERE name = 'Test Package';
```

**Expected:** Should see your test package

**If not found:** Check browser console for error messages

---

## Step 5: Test Creating an Order

1. As a customer, add items to cart
2. Complete checkout
3. Submit payment

Then run in SQL Editor:

```sql
-- Check orders
SELECT id, status, customer_info->>'fullName' as customer, total 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected:** Should see your order

---

## Step 6: Check Browser Console

Open DevTools (F12) → Console tab

Look for these messages:

**Good signs:**
- ✅ Saved to Supabase successfully
- 🌱 Seeding initial data...
- 💾 Saving packages: X
- 💾 Saving orders: X

**Bad signs:**
- ❌ Supabase save error
- ❌ Failed to save to Supabase

---

## Common Issues & Fixes

### Issue: Profile not created
**Symptom:** `/profile` page loads forever

**Fix:** Run manual INSERT query above (Step 2)

### Issue: Packages/items empty in database
**Symptom:** Homepage shows packages but database has 0 rows

**Check:** Browser console for seeding logs
**Fix:** Refresh the page once. The seed function runs on first load.

### Issue: Admin changes don't persist
**Symptom:** Create package in admin, refresh page, it's gone

**Check:** Browser console for "❌ Supabase save error"
**Common cause:** RLS policies blocking insert

**Fix:** Make sure you ran the complete SQL and you're an admin

### Issue: Orders don't save
**Symptom:** Place order, check database, nothing there

**Check:** Browser console for "💾 Saving orders"
**Fix:** Make sure `user_id` column exists in orders table

---

## Debug Mode

Add this to browser console to see what's happening:

```javascript
// Check Supabase configuration
console.log('Supabase configured:', window.location.hostname);

// Check session
const { data } = await supabase.auth.getSession();
console.log('Current session:', data.session?.user?.email);

// Check profile
const { data: profile } = await supabase.from('profiles').select('*');
console.log('My profile:', profile);

// Check packages
const { data: packages } = await supabase.from('prepared_packages').select('count');
console.log('Packages in DB:', packages);

// Check orders
const { data: orders } = await supabase.from('orders').select('count');
console.log('Orders in DB:', orders);
```

---

## Success Checklist

After fixes, verify:

- [ ] Profile exists in database
- [ ] Initial 4 packages seeded
- [ ] Initial 12 items seeded
- [ ] Can create package in admin
- [ ] Package saves to database
- [ ] Can place order as customer
- [ ] Order saves to database
- [ ] Browser console shows "✅ Saved to Supabase"
- [ ] No "❌" error messages in console

---

**Next:** If all checks pass, your database is fully connected! 🎉
