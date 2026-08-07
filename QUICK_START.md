# 🚀 QUICK START - 3 SIMPLE STEPS

## ⚡ Step 1: Run SQL (2 minutes)
1. Open Supabase Dashboard → **SQL Editor**
2. Open file: `ONE_COMPLETE_SETUP.sql`
3. Copy all content → Paste → Click **RUN**
4. ✅ Done! All tables created with auto-profile trigger

## 🎯 Step 2: Sign In (1 minute)
1. Run: `npm run dev`
2. Click **Sign in with Google**
3. ✅ Profile auto-created with role='customer'
4. ✅ Database auto-seeded with initial data

## 👑 Step 3: Become Admin (30 seconds)
1. Go to: `/profile`
2. Change **Role** to "Admin"
3. Click **Update Profile**
4. Refresh page
5. ✅ Access `/admin` dashboard

---

## ✅ What Works Now

### Database Integration
- ✅ All data saves ONLY to Supabase (no localStorage)
- ✅ Profile auto-created on every signup (default: customer)
- ✅ Orders save to database when you checkout
- ✅ All tables: profiles, orders, packages, items, categories, boxes

### Auto-Seeding
- ✅ 4 prepared packages
- ✅ 12 custom items  
- ✅ 9 categories
- ✅ 4 gift box styles
- Happens automatically on first load if database is empty

### Features
- ✅ Admin can manage packages, items, orders
- ✅ Users can order and view their orders
- ✅ Cart persists in session (this is correct)
- ✅ Favicon shows your logo

---

## 🔍 Verify It's Working

### Check Console Logs:
```
✅ Loaded 4 packages from Supabase
✅ Loaded 12 custom items from Supabase
✅ Seeded 9 categories
✅ Seeded 4 gift box styles
✅ Saved to Supabase successfully
```

### Check Admin Dashboard:
Go to `/admin` → Database Debug panel should show:
- Profiles: 1+ (your profile)
- Packages: 4
- Custom Items: 12
- Categories: 9
- Gift Boxes: 4
- Orders: 0 (until you place one)

### Place a Test Order:
1. Add items to cart
2. Go to checkout
3. Complete payment
4. Go to `/admin` → Orders tab
5. ✅ You should see your order in the database!

---

## 📁 Key Files

- **`ONE_COMPLETE_SETUP.sql`** - Run this once in Supabase SQL Editor
- **`src/data/giftsData.ts`** - All data functions (Supabase-only)
- **`src/App.tsx`** - Calls seedInitialData() on load
- **`index.html`** - Has favicon link to logo.png

---

## 🆘 Troubleshooting

**Profile not created?**
- Check console for errors
- Check Supabase Auth → Users (user should exist)
- Check Supabase Table Editor → profiles (profile should exist)
- Re-run `ONE_COMPLETE_SETUP.sql` if trigger missing

**Data not saving?**
- Check console for "❌" error messages
- Check Supabase URL and Key in `.env`
- Check browser console for Supabase errors

**Can't access admin?**
- Go to `/profile` and set role to "Admin"
- Refresh the page
- Try going to `/admin` again

**Seeding not happening?**
- Check console for "🌱 Seeding..." messages
- Database might already have data (seeding only runs if empty)
- Check Admin Dashboard → Database Debug for counts

---

## 🎉 You're All Set!

Everything is now database-driven. No more localStorage for data (only cart sessions). Profile auto-creation works for every user. Just run the SQL file once and you're good to go!
