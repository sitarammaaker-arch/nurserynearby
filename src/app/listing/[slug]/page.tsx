import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Stars, ReviewCard } from "@/components/ui/Cards";

export const metadata: Metadata = {
  title: "Green Paradise Nursery, Delhi — Plant Nursery",
  description: "Premium indoor and flowering plant nursery in Model Town, Delhi.",
};

const NURSERY = {
  name: "Green Paradise Nursery",
  tagline: "Where plants find their home",
  description: "Green Paradise Nursery has been serving plant lovers in Delhi since 1998. Located in the heart of Model Town, we offer an unmatched collection of indoor plants, rare exotics, flowering plants, and garden accessories.\n\nOur expert horticulturists are always on hand to advise you on plant care, soil composition, fertilizers, and seasonal planting strategies suited to Delhi's climate.\n\nWhether you're a first-time plant parent or a seasoned gardener, Green Paradise is your one-stop destination for everything green in Delhi.",
  phone: "+91-98101-23456",
  phone2: "+91-11-2741-5678",
  whatsapp: "919810123456",
  email: "info@greenparadisenursery.in",
  website: "https://greenparadisenursery.in",
  address: "15, Model Town Phase 2, Near Metro Station Gate 3",
  area: "Model Town",
  cityName: "Delhi",
  pincode: "110009",
  openingHours: "Monday – Sunday: 8:00 AM – 8:00 PM",
  established: 1998,
  isFeatured: true,
  isVerified: true,
  avgRating: 4.8,
  totalReviews: 234,
  categories: ["Indoor Plants", "Flower Plants"],
  photos: [
    "https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80",
  ],
};

const REVIEWS = [
  { userName:"Priya Sharma", rating:5, title:"Absolutely the best nursery in Delhi!", comment:"I've been coming here for 3 years. The collection is incredible and the staff genuinely knows their plants.", createdAt:"2025-03-01" },
  { userName:"Rahul Verma", rating:5, title:"Verified contact, great experience", comment:"Called the number on NurseryNearby and it worked immediately. Plants were exactly as described.", createdAt:"2025-02-22" },
  { userName:"Sunita Agarwal", rating:4, title:"Good collection, can be crowded on weekends", comment:"Very good selection of indoor plants. Prices are fair. Weekday visits are less crowded.", createdAt:"2025-02-10" },
];

export default function ListingPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Navbar/>
      <main>
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="container py-3">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Link href="/" className="hover:text-forest">Home</Link>
              <span>/</span>
              <Link href="/nursery/delhi" className="hover:text-forest">Delhi</Link>
              <span>/</span>
              <span className="text-forest font-semibold">{NURSERY.name}</span>
            </nav>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 min-w-0 space-y-8">
              {/* Photos */}
              <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden">
                <div className="col-span-4 sm:col-span-2 relative aspect-[4/3]">
                  <Image src={NURSERY.photos[0]} alt={NURSERY.name} fill className="object-cover"/>
                </div>
                <div className="hidden sm:grid col-span-2 grid-cols-2 gap-2">
                  {NURSERY.photos.slice(1,5).map((src,i) => (
                    <div key={i} className="relative aspect-square">
                      <Image src={src} alt={`Photo ${i+2}`} fill className="object-cover"/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Header */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {NURSERY.isFeatured && <span className="badge badge-gold">⭐ Featured</span>}
                  {NURSERY.isVerified && <span className="badge badge-green">✓ Verified</span>}
                  {NURSERY.categories.map(c => <span key={c} className="badge badge-cream">{c}</span>)}
                </div>
                <h1 className="font-display text-4xl font-bold text-forest-900 mb-1">{NURSERY.name}</h1>
                <p className="text-sage-600 italic text-lg mb-4">{NURSERY.tagline}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Stars rating={NURSERY.avgRating} size="md"/>
                    <span className="font-display text-2xl font-bold text-gray-900">{NURSERY.avgRating}</span>
                    <span className="text-sm text-gray-400">({NURSERY.totalReviews} reviews)</span>
                  </div>
                  <span className="text-sm text-gray-500">📍 {NURSERY.area}, {NURSERY.cityName}</span>
                  <span className="text-sm text-gray-500">Est. {NURSERY.established}</span>
                </div>
              </div>

              {/* About */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-4">About this Nursery</h2>
                {NURSERY.description.split("\n\n").map((p,i) => (
                  <p key={i} className="mb-4 text-gray-600 leading-relaxed">{p}</p>
                ))}
              </div>

              {/* Info */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-4">Nursery Information</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label:"Full Address", value:`${NURSERY.address}, ${NURSERY.cityName} — ${NURSERY.pincode}` },
                    { label:"Opening Hours", value:NURSERY.openingHours },
                    { label:"Phone", value:NURSERY.phone },
                    { label:"Email", value:NURSERY.email },
                    { label:"Website", value:NURSERY.website },
                    { label:"Established", value:String(NURSERY.established) },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <dt className="label mb-1">{item.label}</dt>
                      <dd className="text-sm text-gray-800 font-medium">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold text-forest-900">Customer Reviews</h2>
                  <button className="btn btn-outline btn-sm">Write Review</button>
                </div>
                <div className="space-y-4">
                  {REVIEWS.map((r,i) => <ReviewCard key={i} {...r}/>)}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="card p-5 border-forest-100 shadow-card">
                  <p className="label mb-4">Contact Nursery</p>
                  <div className="space-y-3">
                    <a href={`tel:${NURSERY.phone}`} className="flex items-center gap-3 p-3.5 rounded-xl gradient-forest text-white hover:shadow-green transition-all">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      <div>
                        <p className="text-xs font-bold text-white/70 uppercase tracking-wide">Call Now</p>
                        <p className="font-semibold">{NURSERY.phone}</p>
                      </div>
                    </a>
                    <a href={`https://wa.me/${NURSERY.whatsapp}`} target="_blank" rel="noopener" className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      <div>
                        <p className="text-xs font-bold text-white/70 uppercase">WhatsApp</p>
                        <p className="font-semibold">Chat Now</p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="card p-5">
                  <p className="label mb-3">Opening Hours</p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-semibold mb-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>Open Now
                  </div>
                  <p className="text-sm text-gray-600">{NURSERY.openingHours}</p>
                </div>

                <div className="card p-5">
                  <p className="label mb-3">Location</p>
                  <p className="text-sm text-gray-600 mb-3">{NURSERY.address}, {NURSERY.cityName}</p>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(NURSERY.name + " " + NURSERY.address)}`}
                    target="_blank" className="btn btn-secondary w-full btn-sm justify-center">
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
