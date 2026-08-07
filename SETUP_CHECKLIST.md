# MBM Gifts - Setup Checklist

## ✅ Already Completed

- [x] Supabase project created
- [x] Environment variables configured (`.env` file)
- [x] Google OAuth authentication working
- [x] Profile page created at `/profile`
- [x] Real Google profile pictures showing in navbar
- [x] Checkout payment flow implemented
- [x] My Orders page working
- [x] Gift Shop container width adjusted
- [x] Admin dashboard UI created

## 🔄 Currently Working On: Database Setup

### Step 1: Create Database Tables
**Status:** ⏳ WAITING FOR YOU TO RUN SQL

**What to do:**
1. Open: https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj/editor
2. Click "New Query"
3. Open `SUPABASE_SETUP.md` file
4. Copy the SQL from **Step 1** (starts with `-- Create profiles table`)
5. Paste into Supabase SQL Editor
6. Click **RUN** button
7. You should see "Success. No rows returned"

### Step 2: Make Yourself Admin
**Status:** ⏳ WAITING FOR YOU

**What to do:**
1. First, sign in to your app with Google at: http://localhost:5173
2. Go back to Supabase SQL Editor
3. Follow **Step 3** in `SUPABASE_SETUP.md`
4. Find your user ID and update your role to 'admin'

### Step 3: Configure OAuth Redirects
**Status:** ⏳ WAITING FOR YOU

**What to do:**
1. Open: https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj/auth/url-configuration
2. Add these to "Redirect URLs":
   - `http://localhost:5173/`
   - `http://localhost:5173`
3. Set "Site URL" to: `http://localhost:5173`
4. Click Save

### Step 4: Test Everything
**Status:** ⏳ PENDING

**What to test:**
1. Sign in with Google → Should show your real profile picture
2. Go to `/profile` → Should see your name, email, and role selector
3. Change role to Admin → Click Save
4. Go to `/admin` → Should see admin dashboard (not "Access Denied")
5. Check navbar → Should show your name and Google avatar

## 📋 What You'll See When Working

### Current Behavior (Using LocalStorage):
- ✅ You can add packages in Admin Dashboard
- ✅ You can create orders
- ✅ You can add custom items
- ❌ BUT: All data is saved to browser localStorage only
- ❌ If you clear browser cache, data is lost
- ❌ Different browsers don't share the same data

### After Full Database Migration (Future):
- ✅ All data persists in Supabase database
- ✅ Data syncs across devices
- ✅ Can access from any browser
- ✅ Real-time updates when data changes

## 🚀 Quick Start Commands

```bash
# Install dependencies (if you haven't)
npm install

# Run development server
npm run dev

# Open in browser
# http://localhost:5173
```

## 🔑 Important URLs

- **App (Local):** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin
- **Profile Page:** http://localhost:5173/profile
- **My Orders:** http://localhost:5173/my-orders
- **Supabase Dashboard:** https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj

## 📞 Where to Get Help

### If you see "Access Denied" at /admin:
→ Run Step 2 (Make yourself admin) in `SUPABASE_SETUP.md`

### If Google login doesn't work:
→ Run Step 3 (Configure OAuth) in `SUPABASE_SETUP.md`

### If profile page shows loading forever:
→ Run Step 1 (Create profiles table) in `SUPABASE_SETUP.md`

### If changes in admin don't save:
→ This is expected! We're still using localStorage. Database migration is next phase.

## 🎯 Your Next Action

**RIGHT NOW: Open `SUPABASE_SETUP.md` and follow Step 1, 2, and 3!**

After you complete those steps, everything will be working and you can:
- Access admin dashboard at `/admin`
- Manage your profile at `/profile`
- Create and manage packages, orders, and custom items
- View your orders at `/my-orders`

---

**Questions?** Check `SUPABASE_SETUP.md` for detailed instructions!
