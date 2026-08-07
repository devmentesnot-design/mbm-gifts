# ⚡ ULTRA QUICK START (5 Minutes!)

## Step 1: Open Supabase SQL Editor
**Link:** https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj/editor

Click **"New Query"**

---

## Step 2: Run the Complete Setup SQL

1. Open file: `COMPLETE_DATABASE_SETUP.sql`
2. **Select All** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. Go back to Supabase SQL Editor
5. **Paste** (Ctrl+V)
6. Click **RUN** ▶️

✅ Should see: "Success. No rows returned"

---

## Step 3: Sign In to Your App

1. Open: http://localhost:5173
2. Click **"Login/Sign In"**
3. Choose **"Sign in with Google"**
4. Complete sign-in

✅ You should see your profile picture in navbar

---

## Step 4: Make Yourself Admin

**Back in Supabase SQL Editor:**

1. Click **"New Query"**
2. Paste this:

```sql
-- Find your user ID
SELECT id, email, raw_user_meta_data->>'full_name' as name 
FROM auth.users 
ORDER BY created_at DESC;
```

3. Click **RUN** ▶️
4. **Copy your ID** from the results
5. Click **"New Query"** again
6. Paste this (replace `YOUR_USER_ID` with your ID):

```sql
-- Make yourself admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';

-- Verify
SELECT email, role FROM public.profiles WHERE role = 'admin';
```

7. Click **RUN** ▶️

✅ Should see your email with role = 'admin'

---

## Step 5: Configure OAuth

**Link:** https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj/auth/url-configuration

1. Add to **Redirect URLs:**
   - `http://localhost:5173/`
   - `http://localhost:5173`

2. Set **Site URL:** `http://localhost:5173`

3. Click **Save**

---

## Step 6: Test It!

1. Visit: http://localhost:5173/admin
2. You should see the admin dashboard ✅
3. No "Access Denied" message ✅
4. **NEW:** Blue banner shows database status ✅
5. **NEW:** Purple "Database Debug" panel shows table counts ✅
6. Open browser console (F12) and look for:
   - 🌱 Seeding initial data...
   - ✅ Seeded X packages
   - ✅ Seeded X custom items

---

## 🎉 Done!

You can now:
- ✅ Access admin dashboard at `/admin`
- ✅ Create packages, orders, items **THAT SAVE TO DATABASE**
- ✅ Manage your profile at `/profile`
- ✅ Use the full application

**IMPORTANT CHANGE:** Data now saves to **Supabase first**, not localStorage!

Check the "Database Debug" panel in admin to see real-time status of all tables.

---

**Total Time:** ~5 minutes  
**Files Used:** Just `COMPLETE_DATABASE_SETUP.sql`  
**What's New:** Real database persistence! 🎉
