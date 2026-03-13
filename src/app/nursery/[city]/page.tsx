import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NurseryCard } from "@/components/ui/Cards";
import { CATEGORIES, CITIES } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = CITIES.find((c) => c.slug === params.city);
  const name = city?.name ?? params.city;
  return {
    title: `Nursery in ${name} — Plant Nurseries & Garden Stores`,
    description: `Find the best plant nurseries in ${name}. Browse verified listings, ratings & contact info.`,
  };
}

const DEMO = [
  { id:"1", name:"Green Paradise Nursery", slug:"green-paradise-nursery", tagline:"Where plants find their home", address:"Model Town Phase 2", area:"Model Town", avgRating:4.8, totalReviews:234, phone:"+91-98101-23456", primaryImage:"https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=600&q=80", isFeatured:true, isVerified:true, categories:["Indoor Plants","Flower Plants"], established:1998 },
  { id:"2", name:"Capital Gardens", slug:"capital-gardens", tagline:"Delhi's premier botanical destination", address:"Lajpat Nagar III", area:"Lajpat Nagar", avgRating:4.6, totalReviews:187, phone:"+91-98201-34567", primaryImage:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80", isFeatured:false, isVerified:true, categories:["Rare & Exotic Plants","Succulents & Cactus"], established:2005 },
  { id:"3", name:"Delhi Plant Bazaar", slug:"delhi-plant-bazaar", tagline:"Wholesale & retail since 1990", address:"Mehrauli", area:"Mehrauli", avgRating:4.4, totalReviews:312, phone:"+91-98301-45678", primaryImage:"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80", isFeatured:false, isVerified:false, categories:["Wholesale Nursery"], established:1990 },
  { id:"4", name:"The Plant Studio", slug:"the-plant-studio", tagline:"Curated indoor plants for modern spaces", address:"Hauz Khas Village", area:"Hauz Khas", avgRating:4.9, totalReviews:143, phone:"+91-98401-56789", primaryImage:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", isFeatured:true, isVerified:true, categories:["Indoor Plants"], established:2018 },
  { id:"5", name:"Shiv Nursery", slug:"shiv-nursery", tagline:"Seasonal flowers & landscape plants", address:"Paharganj", area:"Paharganj", avgRating:4.3, totalReviews:89, phone:"+91-98501-67890", primaryImage:"https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80", isFeatured:false, isVerified:true, categories:["Flower Plants","Landscaping"], established:2002 },
  { id:"6", name:"Tropical Roots", slug:"tropical-roots", tagline:"Exotic tropicals & rare finds", address:"Greater Kailash I", area:"GK-I", avgRating:4.7, totalReviews:201, phone:"+91-98601-78901", primaryImage:"https://images.unsplash.com/photo-1552353617-3bfd679b3bdd?w=600&q=80", isFeatured:false, isVerified:true, categories:["Rare & Exotic Plants"], established:2012 },
];

export default function CityPage({ params }: { params: { city: string } }) {
  const city = CITIES.find((c) => c.slug === params.city);
  const cityName = city?.name ?? params.city.replace(/-/g, " ");
  const cityState = city?.state ?? "India";

  return (
    <>
      <Navbar/>
      <main>
        <section className="gradient-sage py-14 border-b border-gray-100">
          <div className="container">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 font-medium">
              <Link href="/" className="hover:text-forest">Home</Link>
              <span>/</span>
              <Link href="/nursery/all" className="hover:text-forest">Nursery</Link>
              <span>/</span>
              <span className="text-forest font-semibold">{cityName}</span>
            </nav>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{city?.emoji ?? "🌱"}</span>
              <div>
                <h1 className="font-display text-4xl font-bold text-forest-900">Nursery in {cityName}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{cityState}, India · {DEMO.length}+ Verified Listings</p>
              </div>
            </div>
            <p className="body-md max-w-xl">Browse verified plant nurseries in {cityName}. Compare ratings, contact directly, and find your perfect plant partner.</p>
          </div>
        </section>

        <div className="container py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 shrink-0 space-y-4">
              <div className="card p-4">
                <p className="label mb-3">Filter by Category</p>
                <div className="space-y-1">
                  <Link href={`/nursery/${params.city}`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-forest bg-forest-50 border border-forest-100">🌱 All Categories</Link>
                  {CATEGORIES.map((c) => (
                    <Link key={c.slug} href={`/nursery/${params.city}/${c.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-forest-50 hover:text-forest transition-colors">
                      <span>{c.icon}</span> {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <p className="label mb-3">Other Cities</p>
                <div className="space-y-1">
                  {CITIES.filter((c) => c.slug !== params.city).slice(0, 8).map((c) => (
                    <Link key={c.slug} href={`/nursery/${c.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-forest-50 hover:text-forest transition-colors">
                      <span>{c.emoji}</span> {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{DEMO.length} nurseries in <strong className="text-forest">{cityName}</strong></p>
                <select className="input text-sm w-auto py-2 px-3">
                  <option>Sort: Featured First</option>
                  <option>Highest Rated</option>
                  <option>Most Reviews</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {DEMO.map((n) => <NurseryCard key={n.id} {...n} cityName={cityName}/>)}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
