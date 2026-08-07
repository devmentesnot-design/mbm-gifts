# 📇 Quick Reference Card

## 🚀 Start Here

**New User?** → Open `YOUR_NEXT_STEPS.md` (15-minute setup)

---

## 🔗 Important URLs

| Name | URL |
|------|-----|
| Local App | http://localhost:5173 |
| Admin Panel | http://localhost:5173/admin |
| Profile Page | http://localhost:5173/profile |
| My Orders | http://localhost:5173/my-orders |
| Supabase Dashboard | https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj |
| SQL Editor | https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj/editor |
| OAuth Config | https://supabase.com/dashboard/project/fpqmnfunfpkvdrxfazgj/auth/url-configuration |

---

## 💻 Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📚 Documentation

| File | What It's For |
|------|---------------|
| `YOUR_NEXT_STEPS.md` | 📖 Start here - 15-min setup guide |
| `README_CURRENT_STATE.md` | 📋 Complete project overview |
| `SUPABASE_SETUP.md` | 🗄️ Detailed database setup |
| `SETUP_CHECKLIST.md` | ✅ Quick checklist |
| `DATABASE_STATUS.md` | 💾 Data storage details |
| `VISUAL_STATUS.md` | 📊 Visual progress dashboard |
| `QUICK_REFERENCE.md` | 📇 This file |

---

## 🔐 Credentials

**Supabase URL:**
```
https://fpqmnfunfpkvdrxfazgj.supabase.co
```

**Location:** `.env` file in project root

---

## 🗄️ Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `profiles` | User profiles & roles | ⏳ Needs creation |
| `prepared_packages` | Gift packages | ⏳ Needs update |
| `orders` | Customer orders | ⏳ Needs update |
| `custom_box_options` | Box items | ⏳ Needs update |

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **Customer** | Browse, shop, order, view own orders |
| **Admin** | All customer access + admin dashboard |

**Change Role:** Go to `/profile` page

---

## 🎯 Current Status

### ✅ Working
- UI/UX (100%)
- Authentication (100%)
- Google OAuth (100%)
- Profile Management (100%)
- Shopping Features (100%)
- Admin Dashboard UI (100%)

### ⚠️ Temporary
- Data uses localStorage (browser only)
- No cross-device sync
- No database backup

### ⏳ Todo
- Complete database setup (15 min)
- Full data migration (4 hours dev work)

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Can't access /admin | Run Step 5 in setup guide |
| Profile loads forever | Run Step 2 in setup guide |
| Google login doesn't work | Run Step 6 in setup guide |
| Data disappears | This is expected - using localStorage |

---

## 🔍 Debug Commands

**Check Supabase session:**
```javascript
// In browser console
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

**Check profile:**
```javascript
// In browser console
const { data } = await supabase.from('profiles').select('*');
console.log('Profile:', data);
```

**View localStorage:**
1. Open DevTools (F12)
2. Go to Application tab
3. Expand Local Storage
4. Look for keys starting with `mbm_`

---

## 📁 Key Files

| File | Location | Purpose |
|------|----------|---------|
| App.tsx | `src/App.tsx` | Main app & routing |
| Supabase Client | `src/lib/supabase.ts` | Database client |
| Data Functions | `src/data/giftsData.ts` | CRUD operations |
| Admin Dashboard | `src/components/AdminDashboard.tsx` | Admin UI |
| Navbar | `src/components/Navbar.tsx` | Navigation |
| Profile Page | `src/components/ProfilePage.tsx` | User profile |

---

## 🎨 Design System

**Colors:**
- Primary: `#8c1119` (Dark Red)
- Accent: `#fbbf24` (Amber/Gold)
- Background: `#1f0305` (Very Dark Red)
- Text: White with opacity variations

**Fonts:**
- Body: Inter
- Headings: Podium Sharp (uppercase)

---

## 📦 Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Vite
- React Router
- Lucide Icons
- Cloudinary

---

## 🚦 Next Action

### Phase 1: Database Setup (15 min)
1. Open `YOUR_NEXT_STEPS.md`
2. Follow steps 1-7
3. Test everything
4. ✅ Done!

### After Phase 1:
- You can fully use the app
- Add real packages in admin
- Test customer flow
- Data still in localStorage (that's OK for now)

---

## 📞 Need Help?

1. **Quick Setup:** `YOUR_NEXT_STEPS.md`
2. **Full Details:** `README_CURRENT_STATE.md`
3. **Database:** `SUPABASE_SETUP.md`
4. **Status:** `VISUAL_STATUS.md`

---

## ✅ Setup Checklist

- [ ] Run `npm install`
- [ ] Start dev server (`npm run dev`)
- [ ] Open `YOUR_NEXT_STEPS.md`
- [ ] Complete Step 1-7 (database setup)
- [ ] Test sign-in with Google
- [ ] Access `/admin` route
- [ ] Create test package
- [ ] View as customer
- [ ] Place test order
- [ ] Check "My Orders" page

---

**Print this page for quick reference while working!**

Last Updated: February 2025
