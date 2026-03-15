import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NurseryCard, CategoryCard } from "@/components/ui/Cards";
import { prisma } from "@/lib/prisma";
import { SITE, CATEGORIES } from "@/lib/utils";

interface Props { params: { state: string } }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const state = await prisma.state.findUnique({ where: { slug: params.state } });
    if (!state) return { title: "State Not Found" };
    const title = `Plant Nursery in ${state.name} — Buy Plants Near You`;
    const desc  = `Find the best plant nurseries across ${state.name}. Browse by district, city and category. Verified listings with ratings and contact info.`;
    return {
      title, description: desc,
      alternates: { canonical: `${SITE.url}/${params.state}` },
      openGraph:  { title, description: desc },
    };
  } catch {
    return { title: "State Nurseries" };
  }
}

export default async function StatePage({ params }: Props) {
  let state: any = null;
  let districts: any[] = [];
  let nurseries: any[] = [];
  let cities: any[] = [];

  try {
    state = await prisma.state.findUnique({
      where: { slug: params.state },
    });
    if (!state) notFound();

    // Get districts — count nurseries via cities (since districtId on nursery may be null)
    const rawDistricts = await prisma.district.findMany({
      where:   { stateId: state.id, isActive: true },
      include: {
        cities: {
          select: { _count: { select: { nurseries: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    // Sum nursery counts from all cities in each district
    districts = rawDistricts.map((d: any) => ({
      ...d,
      nurseryCount: d.cities.reduce(
        (sum: number, city: any) => sum + (city._count?.nurseries ?? 0), 0
      ),
    }));

    // Get cities in this state
    cities = await prisma.city.findMany({
      where:   { stateId: state.id, isActive: true },
      include: { _count: { select: { nurseries: true } } },
      orderBy: { nurseryCount: "desc" },
      take:    20,
    });

    // Get featured/top nurseries in this state
    nurseries = await prisma.nursery.findMany({
      where: {
        isActive: true,
        city:     { stateId: state.id },
      },
      include: {
        city:       { select: { name: true, slug: true } },
        categories: { include: { category: { select: { name: true } } } },
        photos:     { where: { isPrimary: true }, take: 1 },
      },
      orderBy: [{ isFeatured: "desc" }, { avgRating: "desc" }],
      take:    9,
    });
  } catch (e) {
    console.error(e);
    if (!state) notFound();
  }

  const nurseryCards = nurseries.map((n: any) => ({
    id:           n.id,
    name:         n.name,
    slug:         n.slug,
    tagline:      n.tagline,
    address:      n.address,
    area:         n.area,
    cityName:     n.city.name,
    avgRating:    n.avgRating,
    totalReviews: n.totalReviews,
    phone:        n.phone,
    primaryImage: n.photos[0]?.url ?? null,
    isFeatured:   n.isFeatured,
    isVerified:   n.isVerified,
    categories:   n.categories.map((c: any) => c.category.name),
    established:  n.established,
  }));

  // Schema
  const schema = {
    "@context":  "https://schema.org",
    "@type":     "ItemList",
    name:        `Plant Nurseries in ${state.name}`,
    numberOfItems: state.nurseryCount,
    url:         `${SITE.url}/${params.state}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <main>

        {/* Header */}
        <section className="gradient-sage border-b border-gray-100 py-14">
          <div className="container">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-medium flex-wrap">
              <Link href="/"       className="hover:text-forest">Home</Link>
              <span>/</span>
              <Link href="/states" className="hover:text-forest">All States</Link>
              <span>/</span>
              <span className="text-forest font-semibold">{state.name}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-forest text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                    {state.code}
                  </span>
                  {state.capital && (
                    <span className="text-sm text-gray-500">📍 Capital: {state.capital}</span>
                  )}
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest-900 mb-2">
                  Plant Nursery in {state.name}
                </h1>
                <p className="text-gray-500">
                  {state.nurseryCount > 0 ? `${state.nurseryCount} nurseries` : "Browse nurseries"} ·{" "}
                  {districts.length} districts · {cities.length} cities
                </p>
              </div>
              <Link href="/add-listing" className="btn btn-primary shrink-0">
                + Add Your Nursery
              </Link>
            </div>
          </div>
        </section>

        {/* Districts grid */}
        {districts.length > 0 && (
          <section className="section-sm bg-white border-b border-gray-100">
            <div className="container">
              <h2 className="font-display text-2xl font-bold text-forest-900 mb-6">
                Browse by District
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {districts.map((dist: any) => (
                  <Link key={dist.id}
                    href={`/${params.state}/${dist.slug}`}
                    className="group card-hover p-4 flex flex-col gap-1.5">
                    <h3 className="font-semibold text-sm text-gray-800 group-hover:text-forest transition-colors leading-tight">
                      {dist.name}
                    </h3>
                    <p className="text-2xs text-gray-400">
                      {dist._count?.nurseries > 0
                        ? `${dist._count.nurseries} nurseries`
                        : "Browse →"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cities in this state */}
        {cities.length > 0 && (
          <section className="section-sm bg-gray-50 border-b border-gray-100">
            <div className="container">
              <h2 className="font-display text-2xl font-bold text-forest-900 mb-6">
                Browse by City
              </h2>
              <div className="flex flex-wrap gap-2">
                {cities.map((city: any) => (
                  <Link key={city.id} href={`/nursery/${city.slug}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-forest hover:bg-forest-50 transition-all group text-sm">
                    <span className="font-semibold text-gray-800 group-hover:text-forest">{city.name}</span>
                    {city._count?.nurseries > 0 && (
                      <span className="badge badge-cream text-2xs">{city._count.nurseries}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category filter */}
        <section className="sticky z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="container py-3">
            <div className="flex gap-2 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <Link href={`/${params.state}`}
                className="inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border bg-forest text-white border-forest">
                All Types
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/${params.state}?category=${c.slug}`}
                  className="inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border bg-white text-gray-600 border-gray-200 hover:border-forest hover:text-forest transition-all">
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Nurseries grid */}
        <section className="section">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-forest-900">
                Top Nurseries in {state.name}
              </h2>
              {state.nurseryCount > 9 && (
                <span className="text-sm text-gray-400">{state.nurseryCount} total</span>
              )}
            </div>

            {nurseryCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nurseryCards.map((n) => <NurseryCard key={n.id} {...n} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="font-display text-xl font-bold text-gray-700 mb-2">
                  No nurseries listed yet in {state.name}
                </h3>
                <p className="text-gray-500 mb-6">Be the first to list your nursery here!</p>
                <Link href="/add-listing" className="btn btn-primary btn-lg">
                  Add Free Listing
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Category grid */}
        <section className="section-sm gradient-sage border-t border-gray-100">
          <div className="container">
            <h2 className="font-display text-2xl font-bold text-forest-900 mb-6">
              Browse by Category in {state.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map((c) => (
                <CategoryCard key={c.slug} {...c} citySlug="all" />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
