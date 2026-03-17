import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NurseryCard, CategoryCard, CityCard, BlogCard, SearchBar, Stars } from "@/components/ui/Cards";
import { CATEGORIES, CITIES, SITE } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${SITE.name} — Find Plant Nurseries Near You`,
  description: SITE.desc,
};

/* ── Demo Data ── */
const DEMO_NURSERIES = [
  { id:"1", name:"Green Paradise Nursery", slug:"green-paradise-nursery", tagline:"Where plants find their home", address:"Model Town Phase 2", area:"Model Town", cityName:"Delhi", avgRating:4.8, totalReviews:234, phone:"+91-98101-23456", primaryImage:"https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=600&q=80", isFeatured:true, isVerified:true, categories:["Indoor Plants","Flower Plants"], established:1998 },
  { id:"2", name:"Bloom & Grow Garden", slug:"bloom-grow-garden", tagline:"Rare plants, real care", address:"5th Block, Koramangala", area:"Koramangala", cityName:"Bangalore", avgRating:4.6, totalReviews:187, phone:"+91-98201-34567", primaryImage:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80", isFeatured:true, isVerified:true, categories:["Fruit Plants","Rare & Exotic Plants"], established:2005 },
  { id:"3", name:"Nature's Basket Nursery", slug:"natures-basket-nursery", tagline:"Bringing nature home", address:"Bandra West", area:"Bandra", cityName:"Mumbai", avgRating:4.9, totalReviews:312, phone:"+91-98301-45678", primaryImage:"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80", isFeatured:false, isVerified:true, categories:["Garden Supplies","Landscaping"], established:2001 },
  { id:"4", name:"Harish Plant World", slug:"harish-plant-world", tagline:"Wholesale & retail plants", address:"C-Scheme", area:"C-Scheme", cityName:"Jaipur", avgRating:4.5, totalReviews:143, phone:"+91-98401-56789", primaryImage:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", isFeatured:false, isVerified:false, categories:["Wholesale Nursery"], established:2010 },
  { id:"5", name:"Sukhna Green World", slug:"sukhna-green-world", tagline:"Chandigarh's finest botanicals", address:"Sector 17", area:"Sector 17", cityName:"Chandigarh", avgRating:4.7, totalReviews:201, phone:"+91-98501-67890", primaryImage:"https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80", isFeatured:true, isVerified:true, categories:["Succulents & Cactus","Indoor Plants"], established:2008 },
  { id:"6", name:"Hyderabad Flora Hub", slug:"hyderabad-flora-hub", tagline:"Rare & exotic specialists", address:"Jubilee Hills", area:"Jubilee Hills", cityName:"Hyderabad", avgRating:4.4, totalReviews:98, phone:"+91-98601-78901", primaryImage:"https://images.unsplash.com/photo-1552353617-3bfd679b3bdd?w=600&q=80", isFeatured:false, isVerified:true, categories:["Rare & Exotic Plants","Flower Plants"], established:2015 },
];

const DEMO_BLOGS = [
  { id:"b1", title:"10 Indoor Plants That Thrive in Indian Apartments", slug:"indoor-plants-indian-apartments", excerpt:"Discover which plants survive low light, monsoon humidity, and busy lifestyles — perfect for city living.", category:"Indoor Plants", coverImage:"https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80", publishedAt:new Date("2025-03-08"), readTime:5 },
  { id:"b2", title:"How to Start a Kitchen Garden on a Mumbai Balcony", slug:"kitchen-garden-balcony", excerpt:"From coriander to chillies — a step-by-step guide to edible gardening in compact urban spaces.", category:"Gardening Tips", coverImage:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80", publishedAt:new Date("2025-03-02"), readTime:7 },
  { id:"b3", title:"The Complete Guide to Rare & Exotic Plants in India", slug:"rare-exotic-plants-india", excerpt:"Monstera deliciosa, Bird of Paradise, and more — where to find them and how to keep them alive.", category:"Rare Plants", coverImage:"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80", publishedAt:new Date("2025-02-24"), readTime:8 },
];

const DEMO_CITIES = CITIES.map((c, i) => ({ ...c, nurseryCount: [142,118,97,54,63,41,38,79,88,52,73,65][i] ?? 50 }));

const STATS = [
  { label: "Nurseries Listed",   value: totalNurseries > 0 ? totalNurseries.toLocaleString("en-IN")+"+" : "58,000+", icon: "🌿" },
  { label: "Cities Covered",     value: "120+",    icon: "🏙️" },
  { label: "Happy Customers",    value: "4.8★",    icon: "⭐" },
  { label: "Plant Varieties",    value: "50,000+", icon: "🌺" },
];

export default async function HomePage() {
  // Fetch real featured nurseries from DB
  let featuredNurseries: any[] = [];
  let totalNurseries = 0;
  try {
    featuredNurseries = await prisma.nursery.findMany({
      where:   { isActive: true, isFeatured: true },
      include: {
        city:       { select: { name: true, slug: true } },
        categories: { include: { category: { select: { name: true } } } },
        photos:     { where: { isPrimary: true }, take: 1 },
      },
      orderBy: [{ avgRating: "desc" }, { totalReviews: "desc" }],
      take: 6,
    });
    // Fallback — if no featured, show top rated
    if (featuredNurseries.length === 0) {
      featuredNurseries = await prisma.nursery.findMany({
        where:   { isActive: true },
        include: {
          city:       { select: { name: true, slug: true } },
          categories: { include: { category: { select: { name: true } } } },
          photos:     { where: { isPrimary: true }, take: 1 },
        },
        orderBy: [{ isVerified: "desc" }, { established: "asc" }],
        take: 6,
      });
    }
    totalNurseries = await prisma.nursery.count({ where: { isActive: true } });
  } catch {}

  // Map to NurseryCard format
  const nurseryCards = featuredNurseries.map((n: any) => ({
    id:           n.id,
    name:         n.name,
    slug:         n.slug,
    tagline:      n.tagline,
    address:      n.address,
    area:         n.area,
    cityName:     n.city?.name ?? "",
    avgRating:    n.avgRating,
    totalReviews: n.totalReviews,
    phone:        n.phone,
    primaryImage: n.photos?.[0]?.url ?? null,
    isFeatured:   n.isFeatured,
    isVerified:   n.isVerified,
    categories:   n.categories?.map((c: any) => c.category.name) ?? [],
    established:  n.established,
  }));

  const displayNurseries = nurseryCards.length > 0 ? nurseryCards : DEMO_NURSERIES;

  return (
    <>
      <Navbar/>
      <main>

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden bg-white min-h-[88vh] flex items-center">
          {/* Background botanical illustration */}
          <div className="absolute inset-0 gradient-sage opacity-60"/>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none hidden lg:block">
            <svg viewBox="0 0 600 800" className="h-full w-auto ml-auto">
              <ellipse cx="400" cy="600" rx="200" ry="400" fill="#1a3a2a" transform="rotate(-15 400 600)"/>
              <ellipse cx="500" cy="300" rx="120" ry="300" fill="#4a6741" transform="rotate(10 500 300)"/>
              <circle cx="350" cy="150" r="100" fill="#6b8c6e"/>
              <ellipse cx="550" cy="700" rx="80" ry="200" fill="#2d5a3d" transform="rotate(-25 550 700)"/>
            </svg>
          </div>
          {/* Dot texture */}
          <div className="absolute inset-0 bg-leaf-pattern opacity-50 pointer-events-none"/>

          <div className="container relative py-20 lg:py-32">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-forest-100 text-forest px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-soft">
                <span className="w-1.5 h-1.5 bg-forest rounded-full animate-pulse"/>
                India's Premier Plant Nursery Directory
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-forest-900 leading-[1.05] tracking-tight mb-6">
                Find the Perfect<br/>
                <span className="relative inline-block">
                  <span className="text-forest">Plant Nursery</span>
                  <svg viewBox="0 0 300 12" className="absolute -bottom-1 left-0 w-full" preserveAspectRatio="none">
                    <path d="M0 8 Q75 2 150 7 Q225 12 300 5" fill="none" stroke="#4a6741" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span><br/>
                <span className="text-sage-600 font-semibold text-4xl sm:text-5xl lg:text-6xl">Near You</span>
              </h1>

              <p className="body-lg max-w-lg mb-10 text-forest-700">
                Discover rare botanicals, garden experts & local nurseries trusted by thousands of plant lovers across India.
              </p>

              {/* Search */}
              <div className="max-w-xl">
                <SearchBar large/>
              </div>

              {/* Popular tags */}
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Trending:</span>
                {["Monstera", "Fiddle Leaf Fig", "Bonsai", "Rose Plants", "Money Plant"].map((t) => (
                  <Link key={t} href={`/nursery/search?q=${encodeURIComponent(t)}`}
                    className="text-xs bg-white/80 backdrop-blur-sm border border-gray-200 text-forest px-3 py-1 rounded-full hover:bg-forest hover:text-white hover:border-forest transition-all">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS STRIP ─── */}
        <section className="py-6 bg-forest border-y border-forest-800">
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-forest-700 rounded-2xl overflow-hidden">
              {STATS.map((s) => (
                <div key={s.label} className="bg-forest px-6 py-5 text-center">
                  <span className="text-2xl block mb-1">{s.icon}</span>
                  <span className="font-display text-2xl font-bold text-white block">{s.value}</span>
                  <span className="text-2xs text-forest-300 uppercase tracking-wider font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CATEGORIES ─── */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-heading">
              <span className="badge badge-green mb-3">Browse by Type</span>
              <h2 className="display-md text-forest-900 mb-3">Find Nurseries by Category</h2>
              <p className="body-md max-w-lg mx-auto">From rare exotics to everyday flowering plants — explore every type of nursery near you.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map((c) => <CategoryCard key={c.slug} {...c}/>)}
            </div>
          </div>
        </section>

        {/* ─── FEATURED NURSERIES ─── */}
        <section className="section gradient-sage">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="badge badge-gold mb-3">Hand-picked</span>
                <h2 className="display-md text-forest-900 mb-2">Featured Nurseries</h2>
                <p className="body-md">Top-rated nurseries trusted by plant lovers across India</p>
              </div>
              <Link href="/nursery/all" className="btn btn-outline btn-sm hidden sm:inline-flex">
                View All <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_NURSERIES.map((n) => <NurseryCard key={n.id} {...n}/>)}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/nursery/all" className="btn btn-outline">View All Nurseries</Link>
            </div>
          </div>
        </section>

        {/* ─── CITIES ─── */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-heading">
              <span className="badge badge-cream mb-3">Browse by Location</span>
              <h2 className="display-md text-forest-900 mb-3">Nursery in Your City</h2>
              <p className="body-md max-w-lg mx-auto">We've mapped the best nurseries across India's top cities.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {DEMO_CITIES.map((c) => <CityCard key={c.slug} {...c}/>)}
            </div>
          </div>
        </section>

        {/* ─── RECENTLY ADDED (list) ─── */}
        <section className="section-sm bg-gray-50">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="badge badge-green mb-2">Just Listed</span>
                <h2 className="display-sm text-forest-900">Recently Added Nurseries</h2>
              </div>
              <Link href="/nursery/all?sort=newest" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden divide-y divide-gray-50">
              {[
                { name:"Patel Garden Centre", city:"Pune", cat:"Indoor Plants",   t:"2 hrs ago",   slug:"patel-garden" },
                { name:"Green Leaf Nursery",  city:"Lucknow", cat:"Flower Plants", t:"4 hrs ago",  slug:"green-leaf"   },
                { name:"Sharma Plant World",  city:"Ahmedabad",cat:"Fruit Plants", t:"Yesterday",  slug:"sharma-plants"},
                { name:"Royal Botanics",      city:"Kochi",  cat:"Rare Plants",    t:"Yesterday",  slug:"royal-bots"   },
                { name:"Deva Botanical",      city:"Nagpur", cat:"Garden Supplies", t:"2 days ago", slug:"deva-bots"   },
              ].map((r, i) => (
                <Link key={i} href={`/listing/${r.slug}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-forest-50 group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl gradient-forest flex items-center justify-center text-white text-lg shrink-0">🌱</div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-forest transition-colors text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.city} · {r.cat}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xs text-gray-400 hidden sm:block">{r.t}</span>
                    <span className="badge badge-green">New</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST / WHY US ─── */}
        <section className="section bg-white">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="badge badge-green mb-4">Why NurseryNearby?</span>
                <h2 className="display-md text-forest-900 mb-5 text-balance">India's Most Trusted<br/>Nursery Directory</h2>
                <p className="body-lg mb-8">We personally verify every nursery listing, ensuring you get accurate phone numbers, honest ratings, and real photos — not stock images.</p>
                <div className="space-y-5">
                  {[
                    { icon:"✅", title:"Verified Listings",    desc:"Every nursery is manually reviewed and verified by our local team." },
                    { icon:"⭐", title:"Authentic Reviews",    desc:"Reviews from real plant buyers — no fake ratings, ever." },
                    { icon:"📍", title:"Precise Locations",    desc:"Exact addresses with maps, landmarks & opening hours." },
                    { icon:"🆓", title:"Free for Plant Lovers",desc:"Completely free to search and contact nurseries." },
                  ].map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <div className="w-10 h-10 gradient-forest rounded-xl flex items-center justify-center text-lg shrink-0">{f.icon}</div>
                      <div>
                        <h4 className="font-display font-semibold text-forest-900 mb-0.5">{f.title}</h4>
                        <p className="text-sm text-gray-500">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=400&q=80","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80","https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"].map((src, i) => (
                  <div key={i} className={`relative rounded-2xl overflow-hidden ${i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}>
                    <Image src={src} alt="Nursery" fill className="object-cover hover:scale-105 transition-transform duration-500"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="section gradient-forest relative overflow-hidden">
          <div className="absolute inset-0 bg-leaf-pattern opacity-10 pointer-events-none"/>
          <div className="container relative text-center">
            <span className="text-5xl block mb-5">🌿</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Own a Nursery?</h2>
            <p className="text-forest-200 text-lg max-w-xl mx-auto mb-8">
              Join 12,400+ nurseries listed on NurseryNearby. Get discovered by plant lovers in your city — completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/add-listing" className="btn btn-lg" style={{ background:"#faf7f0", color:"#1a3a2a", fontFamily:"DM Sans, sans-serif" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add Free Listing
              </Link>
              <Link href="/admin/upload" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
                Bulk Upload (Admin)
              </Link>
            </div>
            <p className="text-forest-400 text-xs mt-4">Free listing · No credit card · Live in 24 hours</p>
          </div>
        </section>

        {/* ─── BLOG ─── */}
        <section className="section bg-white">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="badge badge-cream mb-3">Plant Knowledge</span>
                <h2 className="display-md text-forest-900 mb-2">From Our Garden Blog</h2>
                <p className="body-md">Expert tips, care guides & plant inspiration</p>
              </div>
              <Link href="/blog" className="btn btn-outline btn-sm hidden sm:inline-flex">
                All Articles <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_BLOGS.map((p) => <BlogCard key={p.id} {...p}/>)}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section className="section-sm gradient-sage">
          <div className="container">
            <div className="section-heading">
              <span className="badge badge-green mb-3">What Plant Lovers Say</span>
              <h2 className="display-sm text-forest-900">Trusted by 50,000+ Users</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { name:"Priya Sharma", city:"Delhi", text:"Found a rare Monstera Thai Constellation at a nursery 2km from my home. Never knew it existed!", stars:5 },
                { name:"Rahul Verma",  city:"Bangalore", text:"The verified listing badge means everything. Called the number, it worked, visited the same day.", stars:5 },
                { name:"Anjali Gupta", city:"Mumbai", text:"As a nursery owner, I got 40+ new customers in the first month after listing. Incredible ROI.", stars:5 },
              ].map((t, i) => (
                <div key={i} className="card p-6 hover:shadow-card transition-shadow">
                  <Stars rating={t.stars}/>
                  <p className="text-gray-700 text-sm my-4 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-forest rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-900">{t.name}</p>
                      <p className="text-2xs text-gray-400">{t.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer/>
    </>
  );
}
