# NurseryNearby v2.0 — India's Premier Plant Nursery Directory

> Clean, minimal, world-class design with bulk admin upload.

## ✨ Key Features
- 🌿 Premium Playfair Display + DM Sans typography
- 🎨 Forest green & cream natural color system
- 📱 Fully mobile responsive
- 🔍 Search by plant type, city, or name
- 📍 City and category-based browsing
- ⭐ Verified listings with reviews
- 📤 **Admin Bulk Upload**: CSV/Excel → preview → import
- 📊 Admin dashboard with analytics
- 🗂️ Import logs & error reporting
- 🆓 Free listing form for nursery owners

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env
# Add your DATABASE_URL (free: neon.tech)

# 3. Database
npm run db:push
npm run db:seed

# 4. Run
npm run dev
# → http://localhost:3000
```

## 📤 Bulk Upload Guide (Admin)

1. Go to `/admin/upload`
2. Download the CSV template
3. Fill in nursery data (see column reference in UI)
4. Upload the file (CSV or Excel)
5. Preview rows, fix errors if any
6. Click "Import N Nurseries"

**Supported columns**: name, phone, phone2, whatsapp, email, website, address, area, landmark, pincode, city, categories (pipe-separated), description, tagline, openingHours, established, latitude, longitude, isFeatured, isVerified, primaryImageUrl

## 🗂️ Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── nursery/[city]/          # City listings
│   ├── listing/[slug]/          # Nursery profile
│   ├── add-listing/             # Submit form
│   ├── blog/                    # Blog
│   ├── admin/
│   │   ├── upload/              # Bulk Upload ← KEY FEATURE
│   │   ├── listings/            # Manage nurseries
│   │   └── page.tsx             # Dashboard
│   └── api/
│       └── bulk-upload/         # Upload API
├── components/
│   ├── shared/ (Navbar, Footer)
│   └── ui/ (Cards, SearchBar, Stars)
└── lib/utils.ts                 # Constants + helpers
```

## 🛠️ Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS (custom design system)
- Prisma + PostgreSQL (Neon.tech recommended)
- Playfair Display + DM Sans fonts

## 🌐 Deploy to Vercel
```bash
npm i -g vercel
vercel
# Set: DATABASE_URL, NEXT_PUBLIC_SITE_URL
```
"# nurserynearby" 
