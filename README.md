# MBM Luxury Gifts - E-commerce Platform

A modern, full-featured luxury gift shop built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:5173
```

## 📖 Setup Database

**👉 SIMPLE:** Open `ONE_COMPLETE_SETUP.sql` → Paste in Supabase → Run → Done!

That ONE file creates all tables, triggers, and policies. Every user who signs in gets a profile automatically with role='customer'. You change yours to 'admin' at `/profile`.

---

## 📚 All Documentation
- **[README_CURRENT_STATE.md](./README_CURRENT_STATE.md)** - Complete project overview & features
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed database setup instructions
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Quick reference checklist
- **[DATABASE_STATUS.md](./DATABASE_STATUS.md)** - Current data storage status

## ✨ Features

### For Customers:
- 🎁 Browse curated luxury gift packages
- 🎨 Build custom gift boxes
- 🛒 Shopping cart with quantity management
- 💳 Checkout with payment submission
- 📦 Order tracking and history
- 👤 Profile management
- 🌍 English/Amharic language switcher

### For Admins:
- 📊 Executive dashboard with analytics
- 📦 Package management (CRUD)
- 🎁 Custom items management
- 📋 Order management with status updates
- 👥 Customer directory
- 🏷️ Category management
- 📦 Gift box styles management

## 🔐 Authentication

- Google OAuth via Supabase
- Role-based access control (Customer/Admin)
- Protected admin routes
- Real Google profile pictures

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Routing:** React Router (SPA)
- **Icons:** Lucide React
- **Image Upload:** Cloudinary
- **Build Tool:** Vite

## 📁 Project Structure

```
mbm-gifts/
├── src/
│   ├── components/       # React components
│   ├── data/            # Data functions
│   ├── lib/             # Supabase client
│   ├── context/         # React context (i18n)
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   └── App.tsx          # Main app
├── public/              # Static assets
└── Documentation files  # Setup guides
```

## ⚙️ Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🗄️ Database

The application uses Supabase PostgreSQL with these tables:
- `profiles` - User profiles and roles
- `prepared_packages` - Ready-made gift packages
- `orders` - Customer orders
- `custom_box_options` - Individual items for custom boxes

**Setup:** Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🚀 Deployment

The app can be deployed to:
- Vercel
- Netlify
- Any static hosting service

**Build command:** `npm run build`  
**Output directory:** `dist/`

## 📝 License

Private project - All rights reserved

## 🙋 Need Help?

1. **Getting Started:** Read [YOUR_NEXT_STEPS.md](./YOUR_NEXT_STEPS.md)
2. **Project Overview:** Read [README_CURRENT_STATE.md](./README_CURRENT_STATE.md)
3. **Database Setup:** Read [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

**Status:** Development Ready ✅ | Database Setup Required ⏳
