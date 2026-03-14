import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Stars, ReviewCard } from "@/components/ui/Cards";
import { prisma } from "@/lib/prisma";
import { SITE, CATEGORIES } from "@/lib/utils";
import { listingPageMeta, listingSchema, breadcrumbSchema } from "@/lib/seo";

interface Props { params: { slug: string } }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const n = await prisma.nursery.findUnique({
      where:   { slug: params.slug },
      include: {
        city:       true,
        categories: { include: { category: { select: { name: true } } } },
        photos:     { where: { isPrimary: true }, take: 1 },
      },
    });
    if (!n) return { title: "Nursery Not Found" };
    return listingPageMeta({
      name:         n.name,
      slug:         n.slug,
      cityName:     n.city.name,
      citySlug:     n.city.slug,
      description:  n.description,
      categories:   n.categories.map((c) => c.category.name),
      avgRating:    n.avgRating,
      totalReviews: n.totalReviews,
      photoUrl:     n.photos[0]?.url ?? null,
    });
  } catch {
    return { title: "Nursery" };
  }
}

export default async function ListingPage({ params }: Props) {
  let nursery: any = null;

  try {
    nursery = await prisma.nursery.findUnique({
      where: { slug: params.slug },
      include: {
        city: true,
        categories: { include: { category: true } },
        photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });
  } catch (e) {
    console.error("Listing page DB error:", e);
  }

  // Not found — show 404
  if (!nursery) notFound();

  const primaryPhoto = nursery.photos?.find((p: any) => p.isPrimary) ?? nursery.photos?.[0];
  const gallery = nursery.photos?.filter((p: any) => !p.isPrimary).slice(0, 4) ?? [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.url}/listing/${nursery.slug}`,
    name: nursery.name,
    description: nursery.description,
    telephone: nursery.phone,
    email: nursery.email,
    url: nursery.website ?? `${SITE.url}/listing/${nursery.slug}`,
    image: nursery.photos?.map((p: any) => p.url) ?? [],
    address: {
      "@type": "PostalAddress",
      streetAddress: nursery.address,
      addressLocality: nursery.city.name,
      addressRegion: nursery.city.state,
      postalCode: nursery.pincode ?? "",
      addressCountry: "IN",
    },
    ...(nursery.latitude && nursery.longitude && {
      geo: { "@type": "GeoCoordinates", latitude: nursery.latitude, longitude: nursery.longitude },
    }),
    ...(nursery.totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: nursery.avgRating,
        reviewCount: nursery.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",            item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Nursery",         item: `${SITE.url}/nursery/all` },
      { "@type": "ListItem", position: 3, name: nursery.city.name, item: `${SITE.url}/nursery/${nursery.city.slug}` },
      { "@type": "ListItem", position: 4, name: nursery.name,      item: `${SITE.url}/listing/${nursery.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <Navbar />
      <main>

        {/* Hero banner */}
        <div className="relative h-72 sm:h-96 lg:h-[480px] bg-forest-50 overflow-hidden">
          {primaryPhoto ? (
            <Image src={primaryPhoto.url} alt={nursery.name} fill className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center gradient-sage">
              <span className="text-9xl opacity-20">🌿</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <div className="container">
              <div className="flex flex-wrap gap-2 mb-3">
                {nursery.isVerified && <span className="badge badge-green">✓ Verified</span>}
                {nursery.isFeatured && <span className="badge badge-gold">⭐ Featured</span>}
                {nursery.established && (
                  <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
                    Est. {nursery.established}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-shadow-lg mb-1">
                {nursery.name}
              </h1>
              {nursery.tagline && (
                <p className="text-white/80 text-lg italic">{nursery.tagline}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[104px] z-20">
          <div className="container py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {nursery.phone && (
              <a href={`tel:${nursery.phone}`} className="btn btn-primary btn-sm shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                Call Now
              </a>
            )}
            {nursery.whatsapp && (
              <a href={`https://wa.me/${nursery.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="btn btn-sm shrink-0" style={{ background: "#25D366", color: "white" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2C6.477 2 2 6.478 2 12.004c0 1.76.46 3.47 1.33 4.97L2 22l5.15-1.31A9.95 9.95 0 0 0 12 22c5.524 0 9.998-4.477 9.998-9.996S17.528 2 12.004 2z"/>
                </svg>
                WhatsApp
              </a>
            )}
            {nursery.latitude && nursery.longitude && (
              <a href={`https://maps.google.com/?q=${nursery.latitude},${nursery.longitude}`}
                target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                </svg>
                Directions
              </a>
            )}
            <span className="text-gray-200 hidden sm:block">|</span>
            <div className="flex items-center gap-2 shrink-0">
              <Stars rating={Math.round(nursery.avgRating)} size="sm" />
              <span className="font-bold text-gray-900 text-sm">
                {nursery.avgRating > 0 ? nursery.avgRating.toFixed(1) : "New"}
              </span>
              {nursery.totalReviews > 0 && (
                <span className="text-xs text-gray-400">({nursery.totalReviews} reviews)</span>
              )}
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: content */}
            <div className="lg:col-span-2 space-y-6">

              {/* About */}
              <div className="card p-7">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-4">About {nursery.name}</h2>
                {nursery.description ? (
                  <div className="space-y-3">
                    {nursery.description.split("\n\n").map((para: string, i: number) => (
                      <p key={i} className="text-gray-600 leading-relaxed">{para}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No description added yet.</p>
                )}
              </div>

              {/* Specialities */}
              {nursery.categories?.length > 0 && (
                <div className="card p-7">
                  <h2 className="font-display text-xl font-bold text-forest-900 mb-4">Specialities</h2>
                  <div className="flex flex-wrap gap-3">
                    {nursery.categories.map((nc: any) => {
                      const meta = CATEGORIES.find((c) => c.slug === nc.category.slug);
                      return (
                        <Link key={nc.category.slug}
                          href={`/nursery/${nursery.city.slug}/${nc.category.slug}`}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-gradient-to-br
                            ${meta?.color ?? "from-gray-50 to-white"}
                            ${meta?.border ?? "border-gray-100"}
                            hover:scale-105 transition-all font-semibold text-sm
                            ${meta?.text ?? "text-gray-700"}`}>
                          <span className="text-lg">{nc.category.icon}</span>
                          {nc.category.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Photo gallery */}
              {gallery.length > 0 && (
                <div className="card p-7">
                  <h2 className="font-display text-xl font-bold text-forest-900 mb-4">Photo Gallery</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {gallery.map((photo: any) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
                        <Image src={photo.url} alt={photo.alt ?? nursery.name} fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="card p-7">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-forest-900">Customer Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Stars rating={Math.round(nursery.avgRating)} size="md" />
                    <span className="font-bold text-lg">
                      {nursery.avgRating > 0 ? nursery.avgRating.toFixed(1) : "—"}
                    </span>
                    {nursery.totalReviews > 0 && (
                      <span className="text-sm text-gray-400">({nursery.totalReviews})</span>
                    )}
                  </div>
                </div>
                {nursery.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {nursery.reviews.map((r: any) => (
                      <ReviewCard key={r.id}
                        userName={r.user?.name ?? "Anonymous"}
                        rating={r.rating}
                        title={r.title}
                        comment={r.comment}
                        createdAt={r.createdAt}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">💬</p>
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link href={`/listing/${params.slug}/review`} className="btn btn-outline w-full justify-center">
                    Write a Review
                  </Link>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <aside className="space-y-5">

              {/* Contact card */}
              <div className="card p-6 space-y-3">
                <h3 className="font-display font-bold text-forest-900 mb-2">Contact & Info</h3>

                {nursery.phone && (
                  <a href={`tel:${nursery.phone}`}
                    className="flex items-center gap-3 p-3 bg-forest-50 hover:bg-forest hover:text-white rounded-xl transition-all group">
                    <div className="w-9 h-9 gradient-forest rounded-lg flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xs text-gray-500 group-hover:text-forest-200">Phone</p>
                      <p className="text-sm font-semibold text-forest group-hover:text-white">{nursery.phone}</p>
                    </div>
                  </a>
                )}

                {nursery.phone2 && (
                  <a href={`tel:${nursery.phone2}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-500">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xs text-gray-500">Alt Phone</p>
                      <p className="text-sm font-semibold text-gray-700">{nursery.phone2}</p>
                    </div>
                  </a>
                )}

                {nursery.whatsapp && (
                  <a href={`https://wa.me/${nursery.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-all group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#25D366" }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2C6.477 2 2 6.478 2 12.004c0 1.76.46 3.47 1.33 4.97L2 22l5.15-1.31A9.95 9.95 0 0 0 12 22c5.524 0 9.998-4.477 9.998-9.996S17.528 2 12.004 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xs text-gray-500">WhatsApp</p>
                      <p className="text-sm font-semibold text-gray-700">+{nursery.whatsapp}</p>
                    </div>
                  </a>
                )}

                {nursery.email && (
                  <a href={`mailto:${nursery.email}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-500">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xs text-gray-500">Email</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{nursery.email}</p>
                    </div>
                  </a>
                )}

                {nursery.address && (
                  <div className="flex items-start gap-3 p-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-500">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xs text-gray-500 mb-0.5">Address</p>
                      <p className="text-sm text-gray-700 font-medium">{nursery.address}</p>
                      {nursery.landmark && <p className="text-xs text-gray-400 mt-0.5">{nursery.landmark}</p>}
                      {nursery.area     && <p className="text-xs text-gray-400">{nursery.area}</p>}
                      {nursery.pincode  && <p className="text-xs text-gray-400">PIN: {nursery.pincode}</p>}
                    </div>
                  </div>
                )}

                {nursery.openingHours && (
                  <div className="flex items-start gap-3 p-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-500">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xs text-gray-500 mb-0.5">Opening Hours</p>
                      <p className="text-sm text-gray-700 font-medium">{nursery.openingHours}</p>
                      {nursery.closedOn && <p className="text-xs text-red-500 mt-0.5">Closed: {nursery.closedOn}</p>}
                    </div>
                  </div>
                )}

                {nursery.website && (
                  <a href={nursery.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-500">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xs text-gray-500">Website</p>
                      <p className="text-sm text-forest font-medium hover:underline truncate">
                        {nursery.website.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* City & categories quick links */}
              <div className="card p-5">
                <p className="label mb-3">More in {nursery.city.name}</p>
                <Link href={`/nursery/${nursery.city.slug}`}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-forest bg-forest-50 hover:bg-forest hover:text-white transition-all mb-2">
                  🌿 All Nurseries in {nursery.city.name}
                </Link>
                {nursery.categories?.slice(0, 3).map((nc: any) => (
                  <Link key={nc.category.slug}
                    href={`/nursery/${nursery.city.slug}/${nc.category.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-forest-50 hover:text-forest transition-all">
                    <span>{nc.category.icon}</span> {nc.category.name} in {nursery.city.name}
                  </Link>
                ))}
              </div>

              {/* Google Maps Embed */}
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-display font-bold text-forest-900 text-sm">📍 Location</h3>
                  <a
                    href={
                      nursery.latitude && nursery.longitude
                        ? `https://maps.google.com/?q=${nursery.latitude},${nursery.longitude}`
                        : `https://maps.google.com/?q=${encodeURIComponent(nursery.address + ", " + nursery.city.name + ", India")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-forest font-semibold hover:underline"
                  >
                    Open in Maps ↗
                  </a>
                </div>
                <div className="relative w-full h-56">
                  <iframe
                    title={`Map of ${nursery.name}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={
                      nursery.latitude && nursery.longitude
                        ? `https://maps.google.com/maps?q=${nursery.latitude},${nursery.longitude}&zoom=15&output=embed`
                        : `https://maps.google.com/maps?q=${encodeURIComponent(nursery.address + " " + nursery.city.name + " India")}&zoom=15&output=embed`
                    }
                  />
                </div>
                <div className="px-5 py-3 bg-gray-50 flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-forest shrink-0 mt-0.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{nursery.address}</p>
                    {nursery.landmark && <p className="text-2xs text-gray-400 mt-0.5">{nursery.landmark}</p>}
                    <p className="text-2xs text-gray-400">{nursery.city.name}, India{nursery.pincode ? ` — ${nursery.pincode}` : ""}</p>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="card p-5">
                <p className="label mb-3">Share this Nursery</p>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${nursery.name}: ${SITE.url}/listing/${nursery.slug}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "#25D366" }}>
                    📱 WhatsApp
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${nursery.name} on @NurseryNearby`)}&url=${encodeURIComponent(`${SITE.url}/listing/${nursery.slug}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-[#1DA1F2] text-white hover:opacity-90 transition-all">
                    🐦 Twitter
                  </a>
                </div>
              </div>

            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
